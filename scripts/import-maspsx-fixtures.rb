# SPDX-License-Identifier: MIT
# frozen_string_literal: true

# Import maspsx's ASPSX ground-truth fixtures for the version this package
# emulates.
#
#   ruby scripts/import-maspsx-fixtures.rb <maspsx-clone> <commit>
#
# maspsx (https://github.com/mkst/maspsx, MIT) records, for each small assembly
# source under aspsx/ASM/, the .text words that real ASPSX binaries produce, keyed
# by ASPSX version, in aspsx/fixtures/*.yaml. This keeps the "2.81" case of each
# and writes test/fixtures/aspsx/<name>.json with the source bytes verbatim, the
# -G value, the expected words, and the disassembly comments maspsx generated for
# them. Identical expectations share YAML anchors upstream; the comments are read
# from the raw text because YAML parsing discards them.

require 'fileutils'
require 'json'
require 'yaml'

VERSION = '2.81'
OUT = File.expand_path('../test/fixtures/aspsx', __dir__)

clone, commit = ARGV
if clone.nil? || commit.nil?
  warn 'usage: ruby scripts/import-maspsx-fixtures.rb <maspsx-clone> <commit>'
  exit 2
end

# Map each case key and each anchor name to the comment of every word in its
# literal list. An aliased case ("2.81": *name) resolves through the anchor.
def comments_by_case(text)
  lists = {}
  anchors = {}
  aliases = {}
  current = nil
  text.each_line do |line|
    if (m = line.match(/^\s*"([^"]+)":\s*(?:&(\S+))?\s*$/))
      current = []
      lists[m[1]] = current
      anchors[m[2]] = current if m[2]
    elsif (m = line.match(/^\s*"([^"]+)":\s*\*(\S+)\s*$/))
      aliases[m[1]] = m[2]
      current = nil
    elsif current && (m = line.match(/^\s*-\s*"0x[0-9A-Fa-f]{8}"\s*#\s*(.*?)\s*$/))
      current << m[1].squeeze(' ')
    end
  end
  aliases.each { |key, anchor| lists[key] = anchors.fetch(anchor) }
  lists
end

def fail!(message)
  warn message
  exit 1
end

FileUtils.mkdir_p(OUT)
paths = Dir[File.join(clone, 'aspsx', 'fixtures', '*.yaml')].sort
fail!("no fixtures under #{File.join(clone, 'aspsx', 'fixtures')}") if paths.empty?

paths.each do |path|
  name = File.basename(path, '.yaml')
  text = File.read(path)
  fixture = YAML.safe_load(text, aliases: true)
  words = fixture.fetch('cases')[VERSION] || fail!("#{name}: no #{VERSION} case")
  bad = words.reject { |w| w.match?(/\A0x[0-9A-F]{8}\z/) }
  fail!("#{name}: malformed words #{bad.inspect}") unless bad.empty?

  comments = comments_by_case(text)[VERSION]
  unless comments && comments.length == words.length
    fail!("#{name}: could not read one comment per word")
  end

  options = fixture['options'] || {}
  extra = options['extra_flags'].to_s
  fail!("#{name}: extra_flags #{extra.inspect} are not supported") unless extra.empty?
  data_limit = options['data_limit']
  gp_size =
    if data_limit.nil?
      0
    elsif (m = data_limit.match(/\A-G(\d+)\z/))
      Integer(m[1], 10)
    else
      fail!("#{name}: unrecognised data_limit #{data_limit.inspect}")
    end

  source_path = fixture.fetch('source')
  source = File.binread(File.join(clone, 'aspsx', source_path)).force_encoding(Encoding::UTF_8)
  fail!("#{name}: source is not valid UTF-8") unless source.valid_encoding?

  document = {
    name: name,
    origin: "mkst/maspsx aspsx/fixtures/#{name}.yaml @ #{commit}",
    aspsxVersion: VERSION,
    sourceFile: File.basename(source_path),
    source: source,
    gpSize: gp_size,
    expectedWords: words,
    disassembly: comments
  }
  File.write(File.join(OUT, "#{name}.json"), "#{JSON.pretty_generate(document)}\n")
  puts "#{name}: #{words.length} words, -G #{gp_size}"
end
