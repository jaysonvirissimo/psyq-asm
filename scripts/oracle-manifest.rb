#!/usr/bin/env ruby
# SPDX-License-Identifier: MIT
#
# Write a differential-oracle manifest (the format is documented at the top of
# scripts/oracle.mjs) from a symbol list and a checkout's C sources.
#
#   ruby scripts/oracle-manifest.rb --checkout <dir> --symbols <file> --sources <glob> \
#     --out <manifest.json> [--gp-size 8] [--include <dir>]... [--cpp-flag <flag>]... [--max <n>]
#
# The symbol list holds one function per line, either `name = 0x80012345;` or
# `0x80012345 name`; other lines are ignored. Each listed function is assigned
# to the one source file (matching --sources, relative to the checkout) that
# defines it. Names defined in several files, and names defined in none, are
# reported on stderr and left out. --max keeps the first n functions of the
# symbol list. Keep the manifest outside the repository, or under tmp/: it
# names the matched project's code.

require 'json'
require 'optparse'

KEYWORDS = %w[if while for switch return sizeof do else].freeze

# name => address, in symbol-list order
def read_symbols(path)
  symbols = {}
  File.foreach(path) do |line|
    case line
    when /\A\s*([A-Za-z_]\w*)\s*=\s*(0x\h+)\s*;/ then symbols[Regexp.last_match(1)] ||= Regexp.last_match(2)
    when /\A\s*(0x\h+)\s+([A-Za-z_]\w*)\s*\z/ then symbols[Regexp.last_match(2)] ||= Regexp.last_match(1)
    end
  end
  symbols.transform_values { |address| format('0x%08X', Integer(address, 16)) }
end

# Names of the functions a C file defines (not merely declares).
def defined_functions(text)
  code = text.gsub(%r{/\*.*?\*/}m, ' ').gsub(%r{//[^\n]*}, '')
  definition = /^(?:[A-Za-z_][\w \t*]*[\s*])?([A-Za-z_]\w*)\s*\((?:[^;{}()]|\([^;{}()]*\))*\)\s*\{/
  code.scan(definition).flatten.reject { |name| KEYWORDS.include?(name) }.uniq
end

options = { include: [], cpp_flags: [] }
parser = OptionParser.new do |o|
  o.banner = 'usage: ruby scripts/oracle-manifest.rb --checkout <dir> --symbols <file> ' \
             '--sources <glob> --out <manifest.json> [--gp-size n] [--include dir]... ' \
             '[--cpp-flag flag]... [--max n]'
  o.on('--checkout DIR') { |v| options[:checkout] = v }
  o.on('--symbols FILE') { |v| options[:symbols] = v }
  o.on('--sources GLOB') { |v| options[:sources] = v }
  o.on('--out FILE') { |v| options[:out] = v }
  o.on('--gp-size N', Integer) { |v| options[:gp_size] = v }
  o.on('--include DIR') { |v| options[:include] << v }
  o.on('--cpp-flag FLAG') { |v| options[:cpp_flags] << v }
  o.on('--max N', Integer) { |v| options[:max] = v }
end
begin
  parser.parse!
rescue OptionParser::ParseError => e
  warn e.message, parser.banner
  exit 2
end
unless %i[checkout symbols sources out].all? { |key| options[key] }
  warn parser.banner
  exit 2
end

symbols = read_symbols(options[:symbols])
definers = Hash.new { |h, k| h[k] = [] }
Dir.chdir(options[:checkout]) do
  Dir.glob(options[:sources]).sort.each do |source|
    next unless File.file?(source)

    defined_functions(File.read(source, encoding: 'BINARY')).each do |name|
      definers[name] << source if symbols.key?(name)
    end
  end
end

chosen = {}
symbols.each_key do |name|
  sources = definers.fetch(name, [])
  if sources.empty?
    warn "not defined in any source: #{name}"
  elsif sources.length > 1
    warn "defined in several sources, skipped: #{name} (#{sources.join(', ')})"
  else
    chosen[name] = sources.first
  end
end
chosen = chosen.first(options[:max]).to_h if options[:max]

units = chosen.group_by { |_, source| source }.sort.map do |source, pairs|
  functions = pairs.map { |name, _| { 'name' => name, 'address' => symbols[name] } }
  { 'source' => source, 'functions' => functions.sort_by { |f| Integer(f['address'], 16) } }
end
manifest = { 'gpSize' => options.fetch(:gp_size, 8) }
manifest['cppFlags'] = options[:cpp_flags] unless options[:cpp_flags].empty?
manifest['includeDirs'] = options[:include] unless options[:include].empty?
manifest['units'] = units
File.write(options[:out], "#{JSON.pretty_generate(manifest)}\n")
warn "#{chosen.length} functions in #{units.length} units written to #{options[:out]}"
