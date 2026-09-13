#!/usr/bin/env ruby
# SPDX-License-Identifier: MIT
#
# Oracle B: assemble this repository's own sources with the real ASPSX 2.81 and
# record the .text words it emits, so tests can hold psyq-asm to them.
#
#   npm run build   # not needed; the object reader is a plain Node script
#   ruby scripts/aspsx-oracle.rb --aspsx <ASPSX.EXE> [--wine <command>] [--only <glob>]
#
# ASPSX.EXE comes from a PsyQ SDK you have the rights to use; it is never
# committed. On macOS and Linux it runs under wine. For every VERIFY probe
# (test/fixtures/probes/VERIFY-n.s, -G value from its first line) and every
# compiler fixture (test/fixtures/compiler/g0 and g8), the script assembles a
# copy in a scratch directory, reads the object with scripts/psyq-object.mjs,
# and writes <source>.words.json beside the source. Those words come from the
# repository's own MIT sources, so they are safe to commit. A source the real
# assembler rejects is reported and skipped.

require 'fileutils'
require 'json'
require 'open3'
require 'optparse'
require 'tmpdir'

ROOT = File.expand_path('..', __dir__)
ORIGIN = 'ASPSX 2.81 via scripts/aspsx-oracle.rb'

options = { wine: 'wine' }
parser = OptionParser.new do |o|
  o.banner = 'usage: ruby scripts/aspsx-oracle.rb --aspsx <ASPSX.EXE> [--wine <command>] [--only <glob>]'
  o.on('--aspsx FILE') { |v| options[:aspsx] = File.expand_path(v) }
  o.on('--wine COMMAND') { |v| options[:wine] = v }
  o.on('--only GLOB') { |v| options[:only] = v }
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

# [source path relative to ROOT, -G value]
def sources
  probes = Dir.glob('test/fixtures/probes/VERIFY-*.s', base: ROOT).sort.filter_map do |path|
    first = File.foreach(File.join(ROOT, path)).first.to_s
    gp = first[/-G (\d+)/, 1]
    gp ? [path, Integer(gp)] : warn("no -G value on line 1, skipped: #{path}")
  end
  compiler = %w[g0 g8].flat_map do |dir|
    Dir.glob("test/fixtures/compiler/#{dir}/*.s", base: ROOT).sort.map { |path| [path, Integer(dir[1..])] }
  end
  probes + compiler
end

written = 0
failed = []
Dir.mktmpdir('aspsx-oracle') do |work|
  sources.each do |path, gp|
    next if options[:only] && !File.fnmatch?(options[:only], path, File::FNM_PATHNAME | File::FNM_EXTGLOB)

    # DOS-era tools want short names.
    FileUtils.cp(File.join(ROOT, path), File.join(work, 'IN.S'))
    FileUtils.rm_f(File.join(work, 'IN.OBJ'))
    _, err, run = Open3.capture3(options[:wine], options[:aspsx], '-q', "-G#{gp}", 'IN.S', '-o', 'IN.OBJ',
                                 chdir: work)
    unless run.success? && File.file?(File.join(work, 'IN.OBJ'))
      failed << path
      warn "ASPSX rejected #{path}: #{err.lines.last(3).join.strip}"
      next
    end
    out, err, run = Open3.capture3('node', File.join(ROOT, 'scripts', 'psyq-object.mjs'), File.join(work, 'IN.OBJ'))
    unless run.success?
      failed << path
      warn "could not read the object for #{path}: #{err.strip}"
      next
    end
    words = JSON.parse(out).fetch('words')
    companion = File.join(ROOT, path.sub(/\.s\z/, '.words.json'))
    File.write(companion, "#{JSON.pretty_generate('origin' => ORIGIN, 'gpSize' => gp, 'words' => words)}\n")
    written += 1
    puts "#{path}: #{words.length} words"
  end
end
puts "#{written} companions written, #{failed.length} sources skipped"
exit(failed.empty? ? 0 : 1)
