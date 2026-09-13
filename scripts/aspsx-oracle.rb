#!/usr/bin/env ruby
# SPDX-License-Identifier: MIT
#
# Oracle B: assemble this repository's own sources with the real ASPSX 2.81 and
# record the .text words it emits, so tests can hold psyq-asm to them.
#
#   ruby scripts/aspsx-oracle.rb --aspsx <ASPSX.EXE> --docker [--only <glob>] [--check-only]
#   ruby scripts/aspsx-oracle.rb --aspsx <ASPSX.EXE> [--wine <command>] [--only <glob>] [--check-only]
#
# ASPSX.EXE comes from outside the repository and is never committed. It is a
# 32-bit Windows program, so it runs under wine: with --docker, inside an
# x86-64 Linux container built from scripts/aspsx-wine.Dockerfile (built on
# first use; the binary is mounted read-only, never copied into the image), or
# otherwise under a local wine.
#
# Before recording anything, the script replays every ASPSX ground-truth
# fixture (test/fixtures/aspsx/*.json) and stops unless the assembler it was
# given reproduces all of them word for word. --check-only stops after that.
#
# Then, for every VERIFY probe (test/fixtures/probes/VERIFY-n.s, -G value from
# its first line) and every compiler fixture (test/fixtures/compiler/g0 and g8),
# it assembles a copy in a scratch directory, reads the object with
# scripts/psyq-object.mjs, and writes <source>.words.json beside the source.
# Those words come from the repository's own MIT sources, so they are safe to
# commit. A source the real assembler rejects is reported and skipped.

require 'fileutils'
require 'json'
require 'open3'
require 'optparse'
require 'tmpdir'

ROOT = File.expand_path('..', __dir__)
ORIGIN = 'ASPSX 2.81 via scripts/aspsx-oracle.rb'
IMAGE = 'psyq-asm-aspsx-wine'
DOCKERFILE = File.join(ROOT, 'scripts', 'aspsx-wine.Dockerfile')

options = { wine: 'wine' }
parser = OptionParser.new do |o|
  o.banner = 'usage: ruby scripts/aspsx-oracle.rb --aspsx <ASPSX.EXE> [--docker | --wine <command>] ' \
             '[--only <glob>] [--check-only]'
  o.on('--aspsx FILE') { |v| options[:aspsx] = File.expand_path(v) }
  o.on('--docker') { options[:docker] = true }
  o.on('--wine COMMAND') { |v| options[:wine] = v }
  o.on('--only GLOB') { |v| options[:only] = v }
  o.on('--check-only') { options[:check_only] = true }
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

  # Returns [words, nil] or [nil, message].
  def assemble(source_text, flags)
    File.binwrite(File.join(@work, 'IN.S'), source_text)
    FileUtils.rm_f(File.join(@work, 'IN.OBJ'))
    exe = @options[:docker] ? "/aspsx/#{File.basename(@options[:aspsx])}" : @options[:aspsx]
    args = ['wine', exe, *flags, '-o', 'IN.OBJ', 'IN.S']
    command = @options[:docker] ? ['docker', 'exec', '-w', '/work', @container, *args] : [@options[:wine], *args[1..]]
    out, err, status = Open3.capture3(*command, chdir: @work)
    object = File.join(@work, 'IN.OBJ')
    return [nil, (err + out).lines.map(&:strip).reject(&:empty?).last(4).join(' | ')] unless status.success? && File.file?(object)

    json, err, status = Open3.capture3('node', File.join(ROOT, 'scripts', 'psyq-object.mjs'), object)
    return [nil, "could not read the object: #{err.strip}"] unless status.success?

    [JSON.parse(json).fetch('words'), nil]
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

def ground_truth
  Dir.glob(File.join(ROOT, 'test', 'fixtures', 'aspsx', '*.json')).sort.map { |f| JSON.parse(File.read(f)) }
end

# [source path relative to ROOT, -G value]
def sources
  probes = Dir.glob('test/fixtures/probes/VERIFY-*.s', base: ROOT).sort.filter_map do |path|
    gp = File.foreach(File.join(ROOT, path)).first.to_s[/-G (\d+)/, 1]
    gp ? [path, Integer(gp)] : warn("no -G value on line 1, skipped: #{path}")
  end
  compiler = %w[g0 g8].flat_map do |dir|
    Dir.glob("test/fixtures/compiler/#{dir}/*.s", base: ROOT).sort.map { |path| [path, Integer(dir[1..])] }
  end
  probes + compiler
end

Dir.mktmpdir('aspsx-oracle') do |work|
  assembler = Assembler.new(options, work)
  begin
    # maspsx passed -G only when its fixture named one, and every fixture
    # without one imported as gpSize 0.
    failures = ground_truth.filter_map do |fixture|
      flags = fixture['gpSize'].zero? ? [] : ["-G#{fixture['gpSize']}"]
      words, error = assembler.assemble(fixture['source'], flags)
      next if words == fixture['expectedWords']

      "#{fixture['name']}: #{error || "got #{words.inspect}, expected #{fixture['expectedWords'].inspect}"}"
    end
    if failures.any?
      warn 'the assembler does not reproduce the ASPSX 2.81 ground truth; nothing recorded:', *failures
      exit 1
    end
    puts "ground truth: all #{ground_truth.length} fixtures reproduced"
    exit 0 if options[:check_only]

    written = 0
    failed = []
    sources.each do |path, gp|
      next if options[:only] && !File.fnmatch?(options[:only], path, File::FNM_PATHNAME | File::FNM_EXTGLOB)

      text = File.binread(File.join(ROOT, path))
      # A probe's first line is a comment for people; blank it and keep line numbers.
      text = text.sub(/\A[^\n]*/, '') if path.include?('/probes/')
      # ASPSX rejects a bare line feed; it reads DOS line endings.
      text = text.gsub(/\r?\n/, "\r\n")
      words, error = assembler.assemble(text, ["-G#{gp}"])
      if words.nil?
        failed << path
        warn "skipped #{path}: #{error}"
        next
      end
      companion = File.join(ROOT, path.sub(/\.s\z/, '.words.json'))
      File.write(companion, "#{JSON.pretty_generate('origin' => ORIGIN, 'gpSize' => gp, 'words' => words)}\n")
      written += 1
      puts "#{path}: #{words.length} words"
    end
    puts "#{written} companions written, #{failed.length} sources skipped"
    exit(failed.empty? ? 0 : 1)
  ensure
    assembler.close
  end
end
