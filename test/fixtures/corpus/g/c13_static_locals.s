	.file	1 "c13_static_locals.c"
gcc2_compiled.:
__gnu_compiled_c:
	.rdata
	.text
	.rdata
	.align	2
names:
	.word	$LC0
	.word	$LC1
	.word	$LC2
	.word	$LC3
	.sdata
	.align	2
$LC3:
	.ascii	"three\000"
	.align	2
$LC2:
	.ascii	"two\000"
	.align	2
$LC1:
	.ascii	"one\000"
	.align	2
$LC0:
	.ascii	"zero\000"
	.data
	.text
	.data
	.align	2
table:
	.half	1
	.half	1
	.half	2
	.half	3
	.half	5
	.half	8
	.half	13
	.half	21
	.text
	.align	2
	.align	2
	.globl	name_of
	.sdata
	.align	2
id.6:
	.word	100

	.lcomm	step.7,2
	.text
	.align	2
	.globl	next_id
	.align	2
	.globl	scratch
	.align	2
	.globl	fib_table
	.rdata
	.align	2
$LC4:
	.ascii	"a literal string\000"
	.text
	.align	2
	.globl	literal_length

	.lcomm	calls,4

	.lcomm	buffer,128

	.text
	.def	helper_twice;	.val	helper_twice;	.scl	3;	.type	0x24;	.endef
	.text

	.loc	1 10
LM1:

	.loc	1 10
LM2:
	.ent	helper_twice
helper_twice:
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


	.loc	1 10
LM3:
	.end	helper_twice
	.def	name_of;	.val	name_of;	.scl	2;	.type	0x62;	.endef
	.text

	.loc	1 13
LM4:

	.loc	1 13
LM5:
	.ent	name_of
name_of:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	i;	.val	4;	.scl	17;	.type	0x4;	.endef

	.loc	1 14
LM6:
	lw	$2,calls

	.loc	1 14
LM7:
	#nop
	addu	$2,$2,1
	sw	$2,calls

	.loc	1 15
LM8:
	lui	$2,%hi(names) # high
	addiu	$5,$2,%lo(names) # low
	sltu	$2,$4,4
	.set	noreorder
	.set	nomacro
	beq	$2,$0,$L3
	move	$3,$0
	.set	macro
	.set	reorder

	sll	$3,$4,2
$L3:
	addu	$2,$3,$5
	lw	$2,0($2)
	j	$31

	.loc	1 15
LM9:
	.end	name_of
	.def	next_id;	.val	next_id;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 19
LM10:

	.loc	1 19
LM11:
	.ent	next_id
next_id:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0

	.loc	1 20
LM12:
$Lb0:
	.begin	$Lb0	2
	.def	id;	.val	id.6;	.scl	3;	.type	0x4;	.endef
	.def	step;	.val	step.7;	.scl	3;	.type	0x3;	.endef

	.loc	1 22
LM13:
$Le1:
	.bend	$Le1	4
	lhu	$3,step.7

	.loc	1 23
LM14:
	lw	$2,id.6

	.loc	1 22
LM15:
	addu	$3,$3,2
	sh	$3,step.7

	.loc	1 23
LM16:
	sll	$3,$3,16
	sra	$3,$3,16
	addu	$2,$2,$3
	sw	$2,id.6

	.loc	1 24
LM17:
	j	$31

	.loc	1 24
LM18:
	.end	next_id
	.def	scratch;	.val	scratch;	.scl	2;	.type	0x62;	.endef
	.text

	.loc	1 27
LM19:

	.loc	1 27
LM20:
	.ent	scratch
scratch:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	n;	.val	4;	.scl	17;	.type	0x4;	.endef

	.loc	1 28
LM21:
	lui	$2,%hi(buffer) # high
	addiu	$2,$2,%lo(buffer) # low
	andi	$4,$4,0x007f
	addu	$4,$4,$2
	li	$3,120			# 0x00000078

	.loc	1 29
LM22:
	.set	noreorder
	.set	nomacro
	j	$31
	sb	$3,0($4)
	.set	macro
	.set	reorder


	.loc	1 29
LM23:
	.end	scratch
	.def	fib_table;	.val	fib_table;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 32
LM24:

	.loc	1 32
LM25:
	.ent	fib_table
fib_table:
	.frame	$sp,24,$31		# vars= 0, regs= 2/0, args= 16, extra= 0
	.mask	0x80010000,-4
	.fmask	0x00000000,0
	.def	i;	.val	16;	.scl	17;	.type	0x4;	.endef
	subu	$sp,$sp,24
	sw	$16,16($sp)
	move	$16,$4
	lw	$4,calls
	sw	$31,20($sp)
	.set	noreorder
	.set	nomacro
	jal	helper_twice
	andi	$16,$16,0x0007
	.set	macro
	.set	reorder

	lui	$3,%hi(table) # high
	addiu	$3,$3,%lo(table) # low
	sll	$16,$16,1
	addu	$16,$16,$3
	lh	$3,0($16)
	lw	$31,20($sp)
	lw	$16,16($sp)
	addu	$2,$3,$2
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$sp,$sp,24
	.set	macro
	.set	reorder


	.loc	1 32
LM26:
	.end	fib_table
	.def	literal_length;	.val	literal_length;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 35
LM27:

	.loc	1 35
LM28:
	.ent	literal_length
literal_length:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0

	.loc	1 36
LM29:
$Lb2:
	.begin	$Lb2	2
	.def	s;	.val	3;	.scl	4;	.type	0x12;	.endef
	.def	n;	.val	4;	.scl	4;	.type	0x4;	.endef
	lui	$2,%hi($LC4) # high
	addiu	$3,$2,%lo($LC4) # low

	.loc	1 37
LM30:
	move	$4,$0

	.loc	1 38
LM31:
	lbu	$2,%lo($LC4)($2)
	#nop
	.set	noreorder
	.set	nomacro
	beq	$2,$0,$L10
	addu	$3,$3,1
	.set	macro
	.set	reorder

$L11:

	.loc	1 39
LM32:
	addu	$4,$4,1
	lbu	$2,0($3)
	#nop
	.set	noreorder
	.set	nomacro
	bne	$2,$0,$L11
	addu	$3,$3,1
	.set	macro
	.set	reorder

$L10:

	.loc	1 40
LM33:
$Le3:
	.bend	$Le3	6

	.loc	1 41
LM34:
	.set	noreorder
	.set	nomacro
	j	$31
	move	$2,$4
	.set	macro
	.set	reorder


	.loc	1 41
LM35:
	.end	literal_length
	.def	calls;	.val	calls;	.scl	3;	.type	0x4;	.endef
	.def	buffer;	.val	buffer;	.scl	3;	.dim	128;	.size	128;	.type	0x32;	.endef
	.def	names;	.val	names;	.scl	3;	.dim	4;	.size	16;	.type	0x72;	.endef
	.def	table;	.val	table;	.scl	3;	.dim	8;	.size	16;	.type	0x33;	.endef
