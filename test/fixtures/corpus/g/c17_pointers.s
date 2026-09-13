	.file	1 "c17_pointers.c"
gcc2_compiled.:
__gnu_compiled_c:
	.text
	.align	2
	.align	2
	.globl	entries
	.data
	.align	2
entries:
	.word	$LC0
	.word	twice
	.word	1
	.word	$LC1
	.word	square
	.word	2
	.sdata
	.align	2
$LC1:
	.ascii	"square\000"
	.align	2
$LC0:
	.ascii	"twice\000"
	.text
	.align	2
	.globl	apply
	.align	2
	.globl	run_all
	.align	2
	.globl	advance
	.align	2
	.globl	distance
	.align	2
	.globl	walk
	.align	2
	.globl	select_callback

	.text
	.def	Handler;	.scl	13;	.type	0x94;	.endef
	.def	Entry;	.scl	10;	.type	0x8;	.size	12;	.endef
	.def	name;	.val	0;	.scl	8;	.type	0x12;	.endef
	.def	handler;	.val	4;	.scl	8;	.type	0x94;	.endef
	.def	weight;	.val	8;	.scl	8;	.type	0x4;	.endef
	.def	.eos;	.val	12;	.scl	102;	.tag	Entry;	.size	12;	.endef
	.def	twice;	.val	twice;	.scl	3;	.type	0x24;	.endef
	.text

	.loc	1 7
LM1:

	.loc	1 7
LM2:
	.ent	twice
twice:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	x;	.val	4;	.scl	17;	.type	0x4;	.endef
	.set	noreorder
	.set	nomacro
	j	$31
	sll	$2,$4,1
	.set	macro
	.set	reorder


	.loc	1 7
LM3:
	.end	twice
	.def	square;	.val	square;	.scl	3;	.type	0x24;	.endef
	.text

	.loc	1 8
LM4:

	.loc	1 8
LM5:
	.ent	square
square:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	x;	.val	4;	.scl	17;	.type	0x4;	.endef
	mult	$4,$4
	mflo	$2
	#nop
	j	$31

	.loc	1 8
LM6:
	.end	square
	.def	apply;	.val	apply;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 12
LM7:

	.loc	1 12
LM8:
	.ent	apply
apply:
	.frame	$sp,24,$31		# vars= 0, regs= 1/0, args= 16, extra= 0
	.mask	0x80000000,-8
	.fmask	0x00000000,0
	.def	h;	.val	2;	.scl	17;	.type	0x94;	.endef
	.def	v;	.val	5;	.scl	17;	.type	0x4;	.endef
	subu	$sp,$sp,24
	move	$2,$4
	sw	$31,16($sp)
	.set	noreorder
	.set	nomacro
	jal	$31,$2
	move	$4,$5
	.set	macro
	.set	reorder

	lw	$31,16($sp)
	#nop
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$sp,$sp,24
	.set	macro
	.set	reorder


	.loc	1 12
LM9:
	.end	apply
	.def	run_all;	.val	run_all;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 15
LM10:

	.loc	1 15
LM11:
	.ent	run_all
run_all:
	.frame	$sp,40,$31		# vars= 0, regs= 5/0, args= 16, extra= 0
	.mask	0x800f0000,-8
	.fmask	0x00000000,0
	.def	v;	.val	19;	.scl	17;	.type	0x4;	.endef
$Lb0:
	.begin	$Lb0	1
	.def	i;	.val	17;	.scl	4;	.type	0x4;	.endef
	.def	total;	.val	18;	.scl	4;	.type	0x4;	.endef
	subu	$sp,$sp,40
	sw	$19,28($sp)
	move	$19,$4
	sw	$18,24($sp)

	.loc	1 16
LM12:
	move	$18,$0

	.loc	1 15
LM13:
	sw	$17,20($sp)

	.loc	1 17
LM14:
	move	$17,$18
	lui	$2,%hi(entries) # high

	.loc	1 15
LM15:
	sw	$16,16($sp)

	.loc	1 17
LM16:
	addiu	$16,$2,%lo(entries) # low

	.loc	1 15
LM17:
	sw	$31,32($sp)
$L8:

	.loc	1 18
LM18:
	lw	$2,4($16)
	#nop
	.set	noreorder
	.set	nomacro
	jal	$31,$2
	move	$4,$19
	.set	macro
	.set	reorder

	lw	$3,8($16)
	#nop
	mult	$2,$3

	.loc	1 17
LM19:
	addu	$17,$17,1
	addu	$16,$16,12
	slt	$2,$17,2

	.loc	1 18
LM20:
	mflo	$5

	.loc	1 17
LM21:
	#nop
	.set	noreorder
	.set	nomacro
	bne	$2,$0,$L8
	addu	$18,$18,$5
	.set	macro
	.set	reorder


	.loc	1 19
LM22:
$Le1:
	.bend	$Le1	5
	move	$2,$18

	.loc	1 20
LM23:
	lw	$31,32($sp)
	lw	$19,28($sp)
	lw	$18,24($sp)
	lw	$17,20($sp)
	lw	$16,16($sp)
	#nop
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$sp,$sp,40
	.set	macro
	.set	reorder


	.loc	1 20
LM24:
	.end	run_all
	.def	advance;	.val	advance;	.scl	2;	.type	0x64;	.endef
	.text

	.loc	1 22
LM25:

	.loc	1 22
LM26:
	.ent	advance
advance:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	p;	.val	4;	.scl	17;	.type	0x14;	.endef
	.def	n;	.val	5;	.scl	17;	.type	0x4;	.endef
	sll	$2,$5,2
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$2,$4,$2
	.set	macro
	.set	reorder


	.loc	1 22
LM27:
	.end	advance
	.def	distance;	.val	distance;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 23
LM28:

	.loc	1 23
LM29:
	.ent	distance
distance:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	a;	.val	4;	.scl	17;	.type	0x12;	.endef
	.def	b;	.val	5;	.scl	17;	.type	0x12;	.endef
	.set	noreorder
	.set	nomacro
	j	$31
	subu	$2,$5,$4
	.set	macro
	.set	reorder


	.loc	1 23
LM30:
	.end	distance
	.def	walk;	.val	walk;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 26
LM31:

	.loc	1 26
LM32:
	.ent	walk
walk:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	grid;	.val	4;	.scl	17;	.type	0x54;	.endef
	.def	rows;	.val	5;	.scl	17;	.type	0x4;	.endef
	.def	cols;	.val	6;	.scl	17;	.type	0x4;	.endef

	.loc	1 27
LM33:
$Lb2:
	.begin	$Lb2	2
	.def	r;	.val	9;	.scl	4;	.type	0x4;	.endef
	.def	c;	.val	7;	.scl	4;	.type	0x4;	.endef
	.def	s;	.val	8;	.scl	4;	.type	0x4;	.endef

	.loc	1 28
LM34:
	move	$9,$0
	.set	noreorder
	.set	nomacro
	blez	$5,$L14
	move	$8,$9
	.set	macro
	.set	reorder

$L16:

	.loc	1 29
LM35:
	.set	noreorder
	.set	nomacro
	blez	$6,$L15
	move	$7,$0
	.set	macro
	.set	reorder

	lw	$3,0($4)
$L20:

	.loc	1 30
LM36:
	lw	$2,0($3)

	.loc	1 29
LM37:
	addu	$7,$7,1

	.loc	1 30
LM38:
	addu	$8,$8,$2

	.loc	1 29
LM39:
	slt	$2,$7,$6
	.set	noreorder
	.set	nomacro
	bne	$2,$0,$L20
	addu	$3,$3,4
	.set	macro
	.set	reorder


	.loc	1 28
LM40:
$L15:
	addu	$9,$9,1
	slt	$2,$9,$5
	.set	noreorder
	.set	nomacro
	bne	$2,$0,$L16
	addu	$4,$4,4
	.set	macro
	.set	reorder

$L14:

	.loc	1 31
LM41:
$Le3:
	.bend	$Le3	6

	.loc	1 32
LM42:
	.set	noreorder
	.set	nomacro
	j	$31
	move	$2,$8
	.set	macro
	.set	reorder


	.loc	1 32
LM43:
	.end	walk
	.def	select_callback;	.val	select_callback;	.scl	2;	.type	0x261;	.endef
	.text

	.loc	1 37
LM44:

	.loc	1 37
LM45:
	.ent	select_callback
select_callback:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	which;	.val	4;	.scl	17;	.type	0x4;	.endef
	beq	$4,$0,$L24
	lui	$2,%hi(callback_a) # high
	.set	noreorder
	.set	nomacro
	j	$31
	addiu	$2,$2,%lo(callback_a) # low
	.set	macro
	.set	reorder

$L24:
	lui	$2,%hi(callback_b) # high
	.set	noreorder
	.set	nomacro
	j	$31
	addiu	$2,$2,%lo(callback_b) # low
	.set	macro
	.set	reorder


	.loc	1 37
LM46:
	.end	select_callback
	.def	entries;	.val	entries;	.scl	2;	.tag	Entry;	.dim	2;	.size	24;	.type	0x38;	.endef
