	.file	1 "c08_varargs.c"
gcc2_compiled.:
__gnu_compiled_c:
	.text
	.align	2
	.globl	sum_ints
	.align	2
	.globl	max_of
	.align	2
	.globl	forward

	.text
	.def	va_list;	.scl	13;	.type	0x12;	.endef
	.def	sum_ints;	.val	sum_ints;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 10
LM1:

	.loc	1 10
LM2:
	.ent	sum_ints
sum_ints:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	count;	.val	4;	.scl	17;	.type	0x4;	.endef
$Lb0:
	.begin	$Lb0	1
	.def	ap;	.val	5;	.scl	4;	.type	0x12;	.endef
	.def	total;	.val	6;	.scl	4;	.type	0x4;	.endef
	sw	$6,8($sp)

	.loc	1 12
LM3:
	move	$6,$0

	.loc	1 10
LM4:
	sw	$5,4($sp)

	.loc	1 13
LM5:
	addu	$5,$sp,4

	.loc	1 14
LM6:
	move	$2,$4

	.loc	1 10
LM7:
	sw	$4,0($sp)

	.loc	1 14
LM8:
	addu	$4,$4,-1

	.loc	1 10
LM9:

	.loc	1 14
LM10:
	.set	noreorder
	.set	nomacro
	blez	$2,$L3
	sw	$7,12($sp)
	.set	macro
	.set	reorder

$L4:

	.loc	1 15
LM11:
	addu	$5,$5,4
	lw	$2,-4($5)
	move	$3,$4
	addu	$4,$4,-1
	.set	noreorder
	.set	nomacro
	bgtz	$3,$L4
	addu	$6,$6,$2
	.set	macro
	.set	reorder

$L3:

	.loc	1 17
LM12:
$Le1:
	.bend	$Le1	8

	.loc	1 18
LM13:
	.set	noreorder
	.set	nomacro
	j	$31
	move	$2,$6
	.set	macro
	.set	reorder


	.loc	1 18
LM14:
	.end	sum_ints
	.def	max_of;	.val	max_of;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 21
LM15:

	.loc	1 21
LM16:
	.ent	max_of
max_of:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	count;	.val	4;	.scl	17;	.type	0x4;	.endef
$Lb2:
	.begin	$Lb2	1
	.def	ap;	.val	5;	.scl	4;	.type	0x12;	.endef
	.def	best;	.val	6;	.scl	4;	.type	0x4;	.endef
	.def	v;	.val	3;	.scl	4;	.type	0x4;	.endef
	sw	$5,4($sp)

	.loc	1 25
LM17:
	addu	$5,$sp,8

	.loc	1 21
LM18:
	sw	$4,0($sp)

	.loc	1 26
LM19:
	addu	$4,$4,-1

	.loc	1 21
LM20:
	sw	$6,8($sp)
	sw	$7,12($sp)

	.loc	1 25
LM21:
	lw	$6,-4($5)

	.loc	1 26
LM22:
	.set	noreorder
	.set	nomacro
	blez	$4,$L8
	addu	$5,$5,4
	.set	macro
	.set	reorder


	.loc	1 27
LM23:
$L12:
	lw	$3,-4($5)

	.loc	1 28
LM24:
	#nop
	slt	$2,$6,$3
	beq	$2,$0,$L7

	.loc	1 29
LM25:
	move	$6,$3

	.loc	1 30
LM26:
$L7:
	addu	$4,$4,-1
	.set	noreorder
	.set	nomacro
	bgtz	$4,$L12
	addu	$5,$5,4
	.set	macro
	.set	reorder

$L8:

	.loc	1 32
LM27:
$Le3:
	.bend	$Le3	12

	.loc	1 33
LM28:
	.set	noreorder
	.set	nomacro
	j	$31
	move	$2,$6
	.set	macro
	.set	reorder


	.loc	1 33
LM29:
	.end	max_of
	.def	forward;	.val	forward;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 37
LM30:

	.loc	1 37
LM31:
	.ent	forward
forward:
	.frame	$sp,24,$31		# vars= 0, regs= 2/0, args= 16, extra= 0
	.mask	0x80010000,-4
	.fmask	0x00000000,0
	.def	a;	.val	2;	.scl	17;	.type	0x4;	.endef
	.def	b;	.val	6;	.scl	17;	.type	0x4;	.endef
	subu	$sp,$sp,24
	move	$2,$4
	move	$6,$5
	li	$4,1			# 0x00000001
	move	$5,$2
	addu	$7,$5,$6
	sw	$31,20($sp)
	.set	noreorder
	.set	nomacro
	jal	emit
	sw	$16,16($sp)
	.set	macro
	.set	reorder

	li	$4,2			# 0x00000002
	.set	noreorder
	.set	nomacro
	jal	emit
	move	$16,$2
	.set	macro
	.set	reorder

	addu	$2,$16,$2
	lw	$31,20($sp)
	lw	$16,16($sp)
	#nop
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$sp,$sp,24
	.set	macro
	.set	reorder


	.loc	1 37
LM32:
	.end	forward
