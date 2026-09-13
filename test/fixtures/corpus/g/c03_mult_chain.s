	.file	1 "c03_mult_chain.c"
gcc2_compiled.:
__gnu_compiled_c:
	.text
	.align	2
	.globl	poly
	.align	2
	.globl	mixed_ops
	.align	2
	.globl	unsigned_ops
	.align	2
	.globl	matrix_trace
	.align	2
	.globl	average
	.align	2
	.globl	hash_step

	.text
	.def	poly;	.val	poly;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 6
LM1:

	.loc	1 6
LM2:
	.ent	poly
poly:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	x;	.val	4;	.scl	17;	.type	0x4;	.endef
	.def	a;	.val	5;	.scl	17;	.type	0x4;	.endef
	.def	b;	.val	6;	.scl	17;	.type	0x4;	.endef
	.def	c;	.val	7;	.scl	17;	.type	0x4;	.endef

	.loc	1 7
LM3:
	mult	$5,$4
	mflo	$3
	#nop
	#nop
	addu	$6,$3,$6
	mult	$6,$4
	mflo	$3
	#nop
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$2,$3,$7
	.set	macro
	.set	reorder


	.loc	1 7
LM4:
	.end	poly
	.def	mixed_ops;	.val	mixed_ops;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 11
LM5:

	.loc	1 11
LM6:
	.ent	mixed_ops
mixed_ops:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	a;	.val	4;	.scl	17;	.type	0x4;	.endef
	.def	b;	.val	5;	.scl	17;	.type	0x4;	.endef
	.def	c;	.val	6;	.scl	17;	.type	0x4;	.endef

	.loc	1 12
LM7:
$Lb0:
	.begin	$Lb0	2
$Le1:
	.bend	$Le1	2
	div	$4,$4,$5
	mfhi	$2

	.loc	1 15
LM8:
	addu	$2,$2,$6
	mult	$2,$4
	mflo	$2

	.loc	1 16
LM9:
	#nop
	j	$31

	.loc	1 16
LM10:
	.end	mixed_ops
	.def	unsigned_ops;	.val	unsigned_ops;	.scl	2;	.type	0x2e;	.endef
	.text

	.loc	1 19
LM11:

	.loc	1 19
LM12:
	.ent	unsigned_ops
unsigned_ops:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	a;	.val	4;	.scl	17;	.type	0xe;	.endef
	.def	b;	.val	5;	.scl	17;	.type	0xe;	.endef

	.loc	1 20
LM13:
$Lb2:
	.begin	$Lb2	2
$Le3:
	.bend	$Le3	2
	divu	$3,$4,$5
	mfhi	$2

	.loc	1 22
LM14:
	ori	$5,$5,0x0001
	divu	$4,$4,$5
	mult	$3,$2
	sll	$2,$4,1
	addu	$2,$2,$4
	mflo	$3

	.loc	1 23
LM15:
	#nop
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$2,$3,$2
	.set	macro
	.set	reorder


	.loc	1 23
LM16:
	.end	unsigned_ops
	.def	matrix_trace;	.val	matrix_trace;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 26
LM17:

	.loc	1 26
LM18:
	.ent	matrix_trace
matrix_trace:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	m;	.val	4;	.scl	17;	.type	0x14;	.endef
	.def	n;	.val	5;	.scl	17;	.type	0x4;	.endef

	.loc	1 27
LM19:
$Lb4:
	.begin	$Lb4	2
	.def	i;	.val	6;	.scl	4;	.type	0x4;	.endef
	.def	j;	.val	3;	.scl	4;	.type	0x4;	.endef
	.def	trace;	.val	7;	.scl	4;	.type	0x4;	.endef

	.loc	1 28
LM20:
	move	$6,$0
	.set	noreorder
	.set	nomacro
	blez	$5,$L6
	move	$7,$6
	.set	macro
	.set	reorder

	move	$9,$6
$L8:

	.loc	1 29
LM21:
	.set	noreorder
	.set	nomacro
	blez	$5,$L7
	move	$3,$0
	.set	macro
	.set	reorder

	addu	$2,$9,$6
	sll	$2,$2,2
	addu	$8,$2,$4
$L12:

	.loc	1 30
LM22:
	bne	$6,$3,$L11

	.loc	1 31
LM23:
	lw	$2,0($8)
	#nop
	mult	$2,$2
	mflo	$10
	#nop
	#nop
	addu	$7,$7,$10

	.loc	1 29
LM24:
$L11:
	addu	$3,$3,1
	slt	$2,$3,$5
	bne	$2,$0,$L12

	.loc	1 28
LM25:
$L7:
	addu	$6,$6,1
	slt	$2,$6,$5
	.set	noreorder
	.set	nomacro
	bne	$2,$0,$L8
	addu	$9,$9,$5
	.set	macro
	.set	reorder

$L6:

	.loc	1 32
LM26:
$Le5:
	.bend	$Le5	7

	.loc	1 33
LM27:
	.set	noreorder
	.set	nomacro
	j	$31
	move	$2,$7
	.set	macro
	.set	reorder


	.loc	1 33
LM28:
	.end	matrix_trace
	.def	average;	.val	average;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 36
LM29:

	.loc	1 36
LM30:
	.ent	average
average:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	values;	.val	4;	.scl	17;	.type	0x14;	.endef
	.def	count;	.val	5;	.scl	17;	.type	0x4;	.endef

	.loc	1 37
LM31:
$Lb6:
	.begin	$Lb6	2
	.def	i;	.val	6;	.scl	4;	.type	0x4;	.endef
	.def	sum;	.val	3;	.scl	4;	.type	0x4;	.endef

	.loc	1 38
LM32:
	move	$6,$0
	.set	noreorder
	.set	nomacro
	blez	$5,$L18
	move	$3,$6
	.set	macro
	.set	reorder

$L20:

	.loc	1 39
LM33:
	lw	$2,0($4)

	.loc	1 38
LM34:
	addu	$6,$6,1

	.loc	1 39
LM35:
	addu	$3,$3,$2

	.loc	1 38
LM36:
	slt	$2,$6,$5
	.set	noreorder
	.set	nomacro
	bne	$2,$0,$L20
	addu	$4,$4,4
	.set	macro
	.set	reorder

$L18:

	.loc	1 40
LM37:
	beq	$5,$0,$L22
	div	$5,$3,$5
	.set	noreorder
	.set	nomacro
	j	$31
	move	$2,$5
	.set	macro
	.set	reorder

$L22:
	move	$5,$0
$Le7:
	.bend	$Le7	5
	move	$2,$5

	.loc	1 41
LM38:
	j	$31

	.loc	1 41
LM39:
	.end	average
	.def	hash_step;	.val	hash_step;	.scl	2;	.type	0x25;	.endef
	.text

	.loc	1 44
LM40:

	.loc	1 44
LM41:
	.ent	hash_step
hash_step:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	h;	.val	6;	.scl	17;	.type	0x5;	.endef
	.def	c;	.val	5;	.scl	17;	.type	0x5;	.endef

	.loc	1 46
LM42:
	li	$2,-2043215872			# 0x86370000
	ori	$2,$2,0xa2a3

	.loc	1 45
LM43:
	sll	$6,$4,5
	subu	$6,$6,$4
	addu	$6,$6,$5

	.loc	1 46
LM44:
	mult	$6,$2
	sra	$2,$6,31
	mfhi	$7
	#nop
	#nop
	addu	$4,$7,$6
	sra	$4,$4,19
	subu	$4,$4,$2
	sll	$3,$4,5
	subu	$3,$3,$4
	sll	$2,$3,6
	subu	$2,$2,$3
	sll	$2,$2,3
	addu	$2,$2,$4
	sll	$2,$2,4
	addu	$2,$2,$4
	sll	$2,$2,2
	subu	$2,$2,$4
	.set	noreorder
	.set	nomacro
	j	$31
	subu	$2,$6,$2
	.set	macro
	.set	reorder


	.loc	1 46
LM45:
	.end	hash_step
