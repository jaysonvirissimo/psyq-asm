#!/usr/bin/env ruby
# SPDX-License-Identifier: MIT
#
# Oracle B: assemble this repository's own sources with the real ASPSX 2.81 and
# record what it emits, so tests can hold psyq-asm to it.
#
#   ruby scripts/aspsx-oracle.rb --aspsx <ASPSX.EXE> --docker [--only <glob>] [--check-only]
#   ruby scripts/aspsx-oracle.rb --aspsx <ASPSX.EXE> [--wine <command>] [--only <glob>] [--check-only]
#   ruby scripts/aspsx-oracle.rb --aspsx <ASPSX.EXE> --docker --files <dir>
#
# ASPSX.EXE comes from outside the repository and is never committed (keep it in
# the ignored tmp/ directory). It is a 32-bit Windows program, so it runs under
# wine: with --docker, inside an x86-64 Linux container built from
# scripts/aspsx-wine.Dockerfile (built on first use; the binary is mounted
# read-only, never copied into the image), or otherwise under a local wine.
#
# Before recording anything, the script replays every ASPSX ground-truth
# fixture (test/fixtures/aspsx/*.json) and stops unless the assembler it was
# given reproduces all of them word for word. --check-only stops after that.
#
# Then, for every VERIFY probe (test/fixtures/probes/VERIFY-n.s, -G value from
# its first line), every compiler fixture (test/fixtures/compiler), and every
# corpus file (test/fixtures/corpus), each in g0, g8, and g, it assembles a copy in a scratch directory, reads the object with
# scripts/psyq-object.mjs, and writes <source>.words.json beside the source: the
# .text words, plus the object's section sizes, relocations, and defined
# symbols. Those come from the repository's own MIT sources, so they are safe to
# commit. A source the real assembler rejects is reported and skipped.
#
# --version names the version of the ASPSX.EXE given (2.81 by default): the
# ground truth replayed is that version's, and its companions are named
# <source>.words.json for 2.81 and <source>.aspsx-<version>.words.json otherwise.
#
# With --files, only the .s files directly in <dir> are recorded, beside
# themselves: the -G value comes from a first-line comment naming one (as in
# probes and regression fixtures), otherwise 0 for a name ending in -g0 and 8
# for any other. scripts/fuzz-aspsx.mjs uses this for its generated sources.

require 'fileutils'
require 'json'
require 'open3'
require 'optparse'
require 'tmpdir'

ROOT = File.expand_path('..', __dir__)
IMAGE = 'psyq-asm-aspsx-wine'
DOCKERFILE = File.join(ROOT, 'scripts', 'aspsx-wine.Dockerfile')

options = { wine: 'wine', version: '2.81' }
parser = OptionParser.new do |o|
  o.banner = 'usage: ruby scripts/aspsx-oracle.rb --aspsx <ASPSX.EXE> [--docker | --wine <command>] ' \
             '[--version 2.77|2.81] [--only <glob>] [--files <dir>] [--check-only]'
  o.on('--aspsx FILE') { |v| options[:aspsx] = File.expand_path(v) }
  o.on('--docker') { options[:docker] = true }
  o.on('--wine COMMAND') { |v| options[:wine] = v }
  o.on('--only GLOB') { |v| options[:only] = v }
  o.on('--files DIR') { |v| options[:files] = File.expand_path(v) }
  o.on('--check-only') { options[:check_only] = true }
  o.on('--version VERSION', %w[2.77 2.81]) { |v| options[:version] = v }
end
begin
  parser.parse!
rescue OptionParser::ParseError => e
  warn e.message, parser.banner
  exit 2
end
unless options[:aspsx] && File.file?(options[:aspsx])
  warn parser.banner
  exit 2
end

def run!(*command, **opts)
  out, err, status = Open3.capture3(*command, **opts)
  raise "#{command.join(' ')} failed:\n#{err}#{out}" unless status.success?

  out
end

# Runs ASPSX in a work directory, under a local wine or in one long-lived
# container.
class Assembler
  def initialize(options, work)
    @options = options
    @work = work
    start_container if options[:docker]
  end

  # Returns [object, nil] or [nil, message], where object is the JSON
  # scripts/psyq-object.mjs prints: { "words" => [...], "data" => {...} }.
  def assemble(source_text, flags)
    File.binwrite(File.join(@work, 'IN.S'), source_text)
    FileUtils.rm_f(File.join(@work, 'IN.OBJ'))
    exe = @options[:docker] ? "/aspsx/#{File.basename(@options[:aspsx])}" : @options[:aspsx]
    args = ['wine', exe, *flags, '-o', 'IN.OBJ', 'IN.S']
    command = @options[:docker] ? ['docker', 'exec', '-w', '/work', @container, *args] : [@options[:wine], *args[1..]]
    out, err, status = Open3.capture3(*command, chdir: @work)
    object = File.join(@work, 'IN.OBJ')
    unless status.success? && File.file?(object)
      return [nil, (err + out).lines.map(&:strip).reject(&:empty?).last(4).join(' | ')]
    end

    json, err, status = Open3.capture3('node', File.join(ROOT, 'scripts', 'psyq-object.mjs'), object)
    return [nil, "could not read the object: #{err.strip}"] unless status.success?

    [JSON.parse(json), nil]
  end

  def close
    Open3.capture3('docker', 'rm', '-f', @container) if @container
  end

  private

  def start_container
    _, _, image = Open3.capture3('docker', 'image', 'inspect', IMAGE)
    unless image.success?
      warn "building #{IMAGE} from #{File.basename(DOCKERFILE)} (first use)..."
      run!('docker', 'build', '--platform', 'linux/amd64', '-f', DOCKERFILE, '-t', IMAGE, File.dirname(DOCKERFILE))
    end
    @container = run!('docker', 'run', '-d', '--rm', '--platform', 'linux/amd64',
                      '-v', "#{@work}:/work", '-v', "#{File.dirname(@options[:aspsx])}:/aspsx:ro",
                      IMAGE, 'sh', '-c', 'wineserver -p && sleep infinity').strip
  end
end

def ground_truth(version)
  Dir.glob(File.join(ROOT, 'test', 'fixtures', 'aspsx', '*.json')).sort
     .map { |f| JSON.parse(File.read(f)) }
     .select { |fixture| fixture['aspsxVersion'] == version }
end

# [source path, relative to ROOT or absolute, -G value]
def sources(files)
  if files
    return Dir.glob(File.join(files, '*.s')).sort.map do |path|
      named = File.foreach(path).first.to_s[/\A#.*-G (\d+)/, 1]
      [path, named ? Integer(named) : (path.end_with?('-g0.s') ? 0 : 8)]
    end
  end

  probes = Dir.glob('test/fixtures/probes/VERIFY-*.s', base: ROOT).sort.filter_map do |path|
    gp = File.foreach(File.join(ROOT, path)).first.to_s[/-G (\d+)/, 1]
    gp ? [path, Integer(gp)] : warn("no -G value on line 1, skipped: #{path}")
  end
  # Compiler fixtures and the corpus; g/ is -G 8 output compiled with -g.
  compiled = %w[compiler corpus].product([['g0', 0], ['g8', 8], ['g', 8]]).flat_map do |set, (dir, gp)|
    Dir.glob("test/fixtures/#{set}/#{dir}/*.s", base: ROOT).sort.map { |path| [path, gp] }
  end
  probes + compiled
end

Dir.mktmpdir('aspsx-oracle') do |work|
  assembler = Assembler.new(options, work)
  begin
    # maspsx passed -G only when its fixture named one, and every fixture
    # without one imported as gpSize 0.
    truth = ground_truth(options[:version])
    abort "no ground truth for ASPSX #{options[:version]}" if truth.empty?
    failures = truth.filter_map do |fixture|
      flags = fixture['gpSize'].zero? ? [] : ["-G#{fixture['gpSize']}"]
      object, error = assembler.assemble(fixture['source'], flags)
      words = object && object['words']
      next if words == fixture['expectedWords']

      "#{fixture['name']}: #{error || "got #{words.inspect}, expected #{fixture['expectedWords'].inspect}"}"
    end
    if failures.any?
      warn "the assembler does not reproduce the ASPSX #{options[:version]} ground truth; nothing recorded:", *failures
      exit 1
    end
    puts "ground truth: all #{truth.length} ASPSX #{options[:version]} fixtures reproduced"
    exit 0 if options[:check_only]

    written = 0
    failed = []
    sources(options[:files]).each do |path, gp|
      next if options[:only] && !File.fnmatch?(options[:only], path, File::FNM_PATHNAME | File::FNM_EXTGLOB)

      text = File.binread(File.expand_path(path, ROOT))
      # A first-line comment (probes, regression fixtures) is for people; blank it
      # and keep line numbers.
      text = text.sub(/\A[^\n]*/, '') if text.start_with?('#')
      # ASPSX rejects a bare line feed; it reads DOS line endings.
      text = text.gsub(/\r?\n/, "\r\n")
      object, error = assembler.assemble(text, ["-G#{gp}"])
      if object.nil?
        failed << path
        warn "skipped #{path}: #{error}"
        next
      end
      record = { 'origin' => "ASPSX #{options[:version]} via scripts/aspsx-oracle.rb", 'gpSize' => gp, 'words' => object.fetch('words'), 'data' => object.fetch('data') }
      suffix = options[:version] == '2.81' ? '.words.json' : ".aspsx-#{options[:version]}.words.json"
      File.write(File.expand_path(path.sub(/\.s\z/, suffix), ROOT), "#{JSON.pretty_generate(record)}\n")
      written += 1
      puts "#{path}: #{object.fetch('words').length} words"
    end
    puts "#{written} companions written, #{failed.length} sources skipped"
    exit(failed.empty? ? 0 : 1)
  ensure
    assembler.close
  end
end
