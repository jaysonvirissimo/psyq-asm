# ASPSX 2.81 rule set

This is the specification `psyq-asm` implements: what Sony's assembler, ASPSX
2.81 (shipped with PsyQ 4.4), does to `cc1psx` output. Every rule is tagged with
its evidence:

- **[fixture]**: a ground-truth word list from real ASPSX 2.81, in
  `test/fixtures/aspsx/` (imported from maspsx).
- **[maspsx]**: behaviour of [maspsx](https://github.com/mkst/maspsx) with the
  2.81 configuration, pinned by a ported maspsx unit test in
  `test/unit/maspsx/`, but with no direct 2.81 word fixture.
- **VERIFY-n**: unproven. The default is implemented, carries a `// VERIFY-n`
  comment in the code, and is listed at the end of this document. The
  differential oracle (`scripts/oracle.mjs`) or a run of the real assembler
  settles it.

A rule change without evidence is a bug. Change this document, the code, and a
fixture together.

## Scope

The assembler modelled is ASPSX 2.81 invoked as `aspsx -q -G <n> in.s -o out.o`
without `-0`, on the output of PsyQ 4.4 `cc1psx` at `-O2 -g0`. `-0` (partial
divide expansion) is available as `partialDivExpansion`. ASPSX never reorders
instructions; it expands macros and inserts nops.

maspsx's configuration for 2.81 is: divide traps use `break` (not `tge`), no nop
before an `$at` expansion, no `addiu` in `$at` expansions, `li` expands with
`addiu` for small values, no `$at` for `sltu` with a negative immediate, the
mult/div gap is enforced, and `$gp` addresses both `symbol+offset` and `la`.

## Modes

- `.set reorder` is in effect at the start of the file and again after every
  `.end`. The assembler owns delay slots: a nop follows every branch and jump.
  **[fixture]**
- `.set noreorder`: nothing is inserted for delay slots. The compiler wraps
  branches whose delay slot it has filled in `noreorder` and `nomacro`.
- `.set macro`/`nomacro`, `.set at`/`noat`, and `.set volatile`/`novolatile` are
  accepted and have no effect. The compiler places one-word macros inside
  `nomacro` regions, so enforcing it would reject valid input.

## Registers

`$0` to `$31` and the ABI names (`$zero`, `$at`, `$v0`, ..., `$fp` or `$s8`,
`$ra`) are interchangeable. In `mfc2`/`mtc2`/`lwc2`/`swc2` the coprocessor operand
is a GTE data register; in `cfc2`/`ctc2` it is a control register. Coprocessor
registers never alias general-purpose registers for the nop rules. **[fixture:
cfc2]**

## Macro expansion

`fits16s(x)`: −32768 ≤ x ≤ 32767. `fits16u(x)`: 0 ≤ x ≤ 65535. `small(sym)`: see
"Small data".

| Input | Expansion | Evidence |
| --- | --- | --- |
| `nop` | `sll $0,$0,0` | [fixture] |
| `move rd,rs` | `addu rd,rs,$0` | [maspsx] test_move |
| `negu rd[,rs]` | `subu rd,$0,rs` | VERIFY-8 |
| `li rd,n` | fits16s: `addiu rd,$0,n`. Else fits16u: `ori rd,$0,n` (VERIFY-9). Else `lui rd,hi` and, if the low half is not zero, `ori rd,rd,lo` | [fixture: expand_li, sltu_at] |
| `li.s rd,f` | IEEE single bits: `lui rd,hi` (always), then `ori rd,rd,lo` if the low half is not zero | [maspsx] test_float |
| `li.d rd,d` | IEEE double: low word into `rd` (`addiu rd,$0,0` when zero, else `lui`/`ori`), high word into `rd+1` (`lui`, `ori` if needed) | [maspsx] test_float; pair order VERIFY-10 |
| `la rd,sym[+a]` | small: `addiu rd,$gp,%gp_rel(sym+a)`. Else `lui rd,%hi(sym+a)`; `addiu rd,rd,%lo(sym+a)` | [fixture: la]; [maspsx] test_gp_rel |
| `la rd,n` | as `li` | VERIFY-8 |
| `addu`/`add rd,rs,n` | fits16s: `addiu`/`addi rd,rs,n`. Else `li $at,n`; `addu`/`add rd,rs,$at` | compiler output; out of range VERIFY-11 |
| `subu`/`sub rd,rs,n` | fits16s(−n): `addiu`/`addi rd,rs,−n`. Else `li $at,n`; `subu`/`sub rd,rs,$at` | VERIFY-11 |
| `and`/`or`/`xor rd,rs,n` | fits16u: `andi`/`ori`/`xori`. Else `li $at,n` and the register form | VERIFY-11 |
| `slt`/`sltu rd,rs,n` | fits16s: `slti`/`sltiu`. Else `li $at,n` and the register form | [fixture: sltu_at] |
| `sll`/`srl`/`sra rd,rt,rs` | `sllv`/`srlv`/`srav rd,rt,rs` (the compiler's variable shift) | compiler output |
| `b label` | `beq $0,$0,label` | VERIFY-8 |
| `beqz`/`bnez rs,label` | `beq`/`bne rs,$0,label` | [fixture: div] |
| `j rs` | `jr rs` | compiler output |
| `jal rs` / `jal rd,rs` | `jalr $31,rs` / `jalr rd,rs` | [maspsx] |
| `div rd,rs,rt` (rd ≠ `$0`) | `div rs,rt` · `bne rt,$0,+2` · `nop` · `break 7` · `addiu $at,$0,-1` · `bne rt,$at,+4` · `lui $at,0x8000` · `bne rs,$at,+2` · `nop` · `break 6` · `mflo rd` | [fixture: div] |
| `rem rd,rs,rt` | the same with `mfhi rd` | [maspsx] |
| `divu`/`remu rd,rs,rt` | `divu rs,rt` · `bne rt,$0,+2` · `nop` · `break 7` · `mflo`/`mfhi rd` | VERIFY-12 |
| any of them with `partialDivExpansion` | `div`/`divu rs,rt` · `mflo`/`mfhi rd` | [maspsx] |
| `div`/`rem $0,rs,rt`, or two operands | `div rs,rt` (`divu` for the unsigned forms) | [maspsx] |
| `break n` | two codes: `n >> 10` in bits 25:16, `n & 0x3FF` in bits 15:6. `break a,b` is taken as written; the divide traps are `break 7,0` and `break 6,0` | [maspsx] test_break; [fixture: div]; VERIFY-13 |
| `L rd,n(rs)`, n out of range | `lui $at,%hi(n)` · `addu $at,rs,$at` · `L rd,%lo(n)($at)` | [fixture: addu_at] |
| `L rd,n` (no base) | fits16s: `L rd,n($0)`. Else `lui rd,%hi(n)` · `L rd,%lo(n)(rd)` | [fixture: expand_sb]; VERIFY-14 |
| `L rd,sym[+a]` | small: `L rd,%gp_rel(sym+a)($gp)`. Else `lui rd,%hi(sym+a)` · `L rd,%lo(sym+a)(rd)` | [fixture: gp, gp_offset, lwlw, v0_at] |
| `L rd,sym[+a](rs)` | `lui $at,%hi(sym+a)` · `addu $at,$at,rs` · `L rd,%lo(sym+a)($at)` | [fixture: expand_lw]; small data VERIFY-15 |
| `S rt,n(rs)`, n out of range | `lui $at,%hi(n)` · `addu $at,rs,$at` · `S rt,%lo(n)($at)` | [maspsx] test_at; VERIFY-16 |
| `S rt,n` (no base) | fits16s: `S rt,n($0)`. Else `lui $at,%hi(n)` · `S rt,%lo(n)($at)` | [fixture: expand_sb]; VERIFY-16 |
| `S rt,sym[+a]` | small: `S rt,%gp_rel(sym+a)($gp)`. Else `lui $at,%hi(sym+a)` · `S rt,%lo(sym+a)($at)` | [fixture: v0_at] |
| `S rt,sym[+a](rs)` | `lui $at,%hi(sym+a)` · `addu $at,$at,rs` · `S rt,%lo(sym+a)($at)` | [fixture: expand_sw] |

`L` is any of `lb lbu lh lhu lw lwl lwr lwc2`; `S` is any of `sb sh sw swl swr
swc2`. `lwc2`/`swc2` with a symbol address are rejected; the compiler never
emits them. `$at` is used regardless of `.set noat`.

Rejected as unsupported, because `cc1psx` never emits them: `beq`/`bne` against
an immediate, the `bgt`/`bge`/`blt`/`ble` family, branch-likely forms, `mul`,
`neg`, `not`, and the other GNU macros. An unknown mnemonic or directive is an
error, never skipped.

## Hazard nops

"The next instruction" is the first word of the next statement's expansion,
looking past `.set` options, `.loc`, COFF debugging records, and labels named
`$L<digits>` or `L<non-digit>...`. Any other directive, a section switch, and
any other label end the search. So a consumer whose expansion begins with
`lui $at` does not read the register, while a one-word `$gp` rewrite may.
**[fixture: addu_at, v0_at, expand_sb]**

**H1. Delay slots.** Under `.set reorder`, a nop follows every branch and jump,
before any label that follows it. **[fixture]**

**H2. Load delay.** After a load into a register other than `$0`, when the next
instruction reads that register, a nop goes immediately before that
instruction, after any labels in between (so the labels address the nop).
`lwl`/`lwr` count only their base register as read. The search crosses
`.set noreorder`. **[fixture: cfc2, addu_at, expand_sb]; [maspsx] test_nop,
test_mtlo, test_lwl_lwr_no_nop, test_load_delay_keeps_consecutive_labels_together.**
Whether a load inside a `noreorder` region is also checked is VERIFY-17 (checked).

**H3. The multiply gap.** A `mult`, `multu`, `div`, or `divu` may not start
within two instructions of an `mflo`/`mfhi`. After an `mflo`/`mfhi`, with the
next two instructions X and Y **[fixture: mflomt]; [maspsx] test_mflo**:

1. X is a mult/div: two nops before X.
2. Y is not a mult/div: nothing.
3. X is a load or another `mflo`/`mfhi`: nothing (the count restarts; VERIFY-19).
4. X is a one-word `li`: a nop right after X, before any label. A two-word `li`
   fills the gap.
5. A `.set noreorder` lies between: a nop before that directive.
6. The `mflo`/`mfhi` ends a divide expansion and X reads its register: a nop
   before X.
7. X is a branch or jump: under reorder its delay-slot nop fills the gap; under
   noreorder a nop follows X.
8. Anything else: a nop before Y, after any labels. A multi-word macro other
   than `li` still gets it (VERIFY-20).

When none of these applies to a divide expansion's `mflo`/`mfhi`, H2 applies to
it as if it were a load. **[maspsx] test_div**

**H4. Coprocessor moves.** After `mfc2`/`cfc2`, H2 applies to the register they
write, behind `experimental.copMoveDelayNop` (default on). This is maspsx issue
#118, reported against real ASPSX output. VERIFY-18

`mtc2`/`ctc2` followed by a GTE command gets nothing: PsyQ's inline macros write
their own nops. The compiler's `#nop` comments are ignored entirely; the rules
above decide.

## Small data

With `gpSize` above 0, a symbol is addressed through `$gp` when it is:

1. defined by a label in `.sdata` or `.sbss` in this file **[maspsx]**;
2. declared by `.comm` or `.lcomm` with a size no larger than `gpSize`
   **[fixture: gp, gp_offset, la]**;
3. declared by `.extern sym,size` with a size no larger than `gpSize`. maspsx
   ignores these sizes, but `cc1psx` emits them precisely so the assembler can
   use `$gp`. Behind `experimental.externSmallData` (default on). VERIFY-1

`symbol+offset` forms and `la` use `$gp` too. With `gpSize` 0 nothing is small.

## Relocations

Against a symbol, the relocated field holds 0 and the addend lives in the
relocation: `lw $2,Savemap+2944` assembles to `0x8C420000`. **[fixture: lwlw
(LO16), gp_offset (GPREL16)]**; the same is assumed for HI16, MIPS26, and WORD32
(VERIFY-7).

Against a local label (`$L12`, `$LC0`), the target is the label's section and
offset, and the field holds that offset: `.word $L15` holds the label's offset,
`j $L9` holds its word index, and `%hi`/`%lo` hold the halves of the offset
(VERIFY-6). Consumers compare words under each relocation's `fieldMask`.

Numeric `%hi(n)`/`%lo(n)` fold into constants, with `%hi` adjusted for a negative
`%lo`.

## Sections, data, and functions

`.text` holds code, `.bss` and `.sbss` reserve space, and every other section
holds data. `.align n` pads to 2ⁿ, with nop words in code. `.word` accepts
numbers, symbols with addends, and labels; `.half`, `.short`, and `.byte` accept
numbers. `.ascii` decodes C escapes; `.asciiz` appends a zero byte.

`.comm`/`.lcomm` allocate, in order of appearance after all other contents,
into `.sbss` when no larger than `gpSize` and `.bss` otherwise, aligned to 8, 4,
2, or 1 by size unless an alignment is given. VERIFY-5

`.ent`/`.end` delimit functions; `.frame`, `.mask`, and `.fmask` are recorded on
them.

## Directives

| Directive | Effect |
| --- | --- |
| `.text` `.data` `.rdata` `.sdata` `.sbss` `.bss` `.section name` | switch section |
| `.align n` | pad to 2ⁿ |
| `.globl sym` | global binding |
| `.extern sym[,size]` | undefined symbol with a size (small data rule 3) |
| `.comm sym,size[,align]` `.lcomm sym,size[,align]` | common and local common symbols |
| `.word` `.half` `.short` `.byte` `.ascii` `.asciiz` `.space` | data |
| `.ent` `.end` `.frame` `.mask` `.fmask` | function bookkeeping |
| `.set option` | see "Modes"; an unknown option is a warning |
| `.file` `.loc` | ignored |
| `.stabs` `.stabn` `.stabd` `.def` `.begin` `.bend` `.type` `.size` `.val` `.scl` `.endef` `.dim` `.tag` `.line` | ignored with one warning per file |
| anything else | error |

## Open verification items

The numbering follows the project's original plan, so it has gaps.

| Item | Question | Default | How to settle |
| --- | --- | --- | --- |
| VERIFY-1 | Is `.extern sym,size` with a size no larger than `gpSize` addressed through `$gp`? | yes | oracle: any matched `-G 8` function using an external small global |
| VERIFY-5 | Alignment and order of `.comm`/`.lcomm` allocations | by size, in order of appearance | real assembler; data sections only |
| VERIFY-6 | Field value of a relocation against a local label | the label's offset (word index for jumps) | real assembler |
| VERIFY-7 | Field value of HI16, MIPS26, and WORD32 relocations against symbols | 0 | real assembler |
| VERIFY-8 | Expansions of `negu`, `la` with a number, and `b` | as above | real assembler; not emitted by the compiler |
| VERIFY-9 | `li` for 0x8000 to 0xFFFF | `ori rd,$0,n` | oracle: frame-size constants |
| VERIFY-10 | `li.d` register pair order | low word in `rd` | oracle: double constants |
| VERIFY-11 | Out-of-range immediate forms of `addu`/`subu`/`and`/`or`/`xor` | `li $at` then the register form | real assembler |
| VERIFY-12 | `divu`/`remu` five-word expansion | as above | oracle: unsigned division |
| VERIFY-13 | Placement of a single `break` code | split as maspsx does | real assembler |
| VERIFY-14 | Load from an out-of-range absolute address | `lui rd`, then `L rd,%lo(n)(rd)` | real assembler |
| VERIFY-15 | `L rd,sym(rs)` when `sym` is small data | `$at` form | real assembler |
| VERIFY-16 | Stores with out-of-range offsets or addresses | as above | real assembler |
| VERIFY-17 | Is a load inside `.set noreorder` checked for a delay? | yes | real assembler; not emitted by the compiler |
| VERIFY-18 | Nop after `mfc2`/`cfc2` when the next instruction reads the register | yes | oracle: any matched GTE function |
| VERIFY-19 | `mflo` · load · `mult` gets no gap nop | none | real assembler |
| VERIFY-20 | A multi-word macro other than `li` between `mflo` and `mult` still gets a nop | one nop | real assembler |
| VERIFY-21 | Where `L<non-digit>` debugging labels bind when a nop is inserted before the next instruction | before the nop (maspsx places them after) | real assembler; invisible at `-g0` |
