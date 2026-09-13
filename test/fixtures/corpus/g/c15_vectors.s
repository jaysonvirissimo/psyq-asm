	.file	1 "c15_vectors.c"
gcc2_compiled.:
__gnu_compiled_c:
	.text
	.align	2
	.globl	cross
	.align	2
	.globl	length_squared
	.align	2
	.globl	compose
	.align	2
	.globl	project

	.text
	.def	.0fake;	.scl	10;	.type	0x8;	.size	8;	.endef
	.def	x;	.val	0;	.scl	8;	.type	0x3;	.endef
	.def	y;	.val	2;	.scl	8;	.type	0x3;	.endef
	.def	z;	.val	4;	.scl	8;	.type	0x3;	.endef
	.def	pad;	.val	6;	.scl	8;	.type	0x3;	.endef
	.def	.eos;	.val	8;	.scl	102;	.tag	.0fake;	.size	8;	.endef
	.def	SVector;	.scl	13;	.tag	.0fake;	.size	8;	.type	0x8;	.endef
	.def	.1fake;	.scl	10;	.type	0x8;	.size	12;	.endef
	.def	vx;	.val	0;	.scl	8;	.type	0x5;	.endef
	.def	vy;	.val	4;	.scl	8;	.type	0x5;	.endef
	.def	vz;	.val	8;	.scl	8;	.type	0x5;	.endef
	.def	.eos;	.val	12;	.scl	102;	.tag	.1fake;	.size	12;	.endef
	.def	LVector;	.scl	13;	.tag	.1fake;	.size	12;	.type	0x8;	.endef
	.def	.2fake;	.scl	10;	.type	0x8;	.size	32;	.endef
	.def	m;	.val	0;	.scl	8;	.dim	3,3;	.size	18;	.type	0xf3;	.endef
	.def	t;	.val	20;	.scl	8;	.dim	3;	.size	12;	.type	0x35;	.endef
	.def	.eos;	.val	32;	.scl	102;	.tag	.2fake;	.size	32;	.endef
	.def	Matrix;	.scl	13;	.tag	.2fake;	.size	32;	.type	0x8;	.endef
	.def	cross;	.val	cross;	.scl	2;	.type	0x21;	.endef
	.text

	.loc	1 10
LM1:

	.loc	1 10
LM2:
	.ent	cross
cross:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	a;	.val	4;	.scl	17;	.tag	.0fake;	.size	8;	.type	0x18;	.endef
	.def	b;	.val	5;	.scl	17;	.tag	.0fake;	.size	8;	.type	0x18;	.endef
	.def	out;	.val	6;	.scl	17;	.tag	.1fake;	.size	12;	.type	0x18;	.endef

	.loc	1 11
LM3:
	lh	$3,2($4)
	lh	$2,4($5)
	#nop
	mult	$3,$2
	lh	$3,4($4)
	mflo	$7
	#nop
	lh	$2,2($5)
	#nop
	mult	$3,$2
	mflo	$2
	#nop
	#nop
	subu	$2,$7,$2
	sw	$2,0($6)

	.loc	1 12
LM4:
	lh	$3,4($4)
	lh	$2,0($5)
	#nop
	mult	$3,$2
	lh	$3,0($4)
	mflo	$7
	#nop
	lh	$2,4($5)
	#nop
	mult	$3,$2
	mflo	$2
	#nop
	#nop
	subu	$2,$7,$2
	sw	$2,4($6)

	.loc	1 13
LM5:
	lh	$3,0($4)
	lh	$2,2($5)
	#nop
	mult	$3,$2
	lh	$3,2($4)
	mflo	$7
	#nop
	lh	$2,0($5)
	#nop
	mult	$3,$2
	mflo	$2
	#nop
	#nop
	subu	$2,$7,$2
	.set	noreorder
	.set	nomacro
	j	$31
	sw	$2,8($6)
	.set	macro
	.set	reorder


	.loc	1 13
LM6:
	.end	cross
	.def	length_squared;	.val	length_squared;	.scl	2;	.type	0x25;	.endef
	.text

	.loc	1 17
LM7:

	.loc	1 17
LM8:
	.ent	length_squared
length_squared:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	v;	.val	4;	.scl	17;	.tag	.1fake;	.size	12;	.type	0x18;	.endef

	.loc	1 18
LM9:
	lw	$2,0($4)
	#nop
	sra	$2,$2,6
	mult	$2,$2
	lw	$2,4($4)
	mflo	$5
	#nop
	sra	$2,$2,6
	mult	$2,$2
	lw	$2,8($4)
	mflo	$3
	#nop
	sra	$2,$2,6
	mult	$2,$2
	addu	$2,$5,$3
	mflo	$7
	#nop
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$2,$2,$7
	.set	macro
	.set	reorder


	.loc	1 18
LM10:
	.end	length_squared
	.def	compose;	.val	compose;	.scl	2;	.type	0x21;	.endef
	.text

	.loc	1 22
LM11:

	.loc	1 22
LM12:
	.ent	compose
compose:
	.frame	$sp,16,$31		# vars= 0, regs= 3/0, args= 0, extra= 0
	.mask	0x00070000,-8
	.fmask	0x00000000,0
	.def	a;	.val	16;	.scl	17;	.tag	.2fake;	.size	32;	.type	0x18;	.endef
	.def	b;	.val	17;	.scl	17;	.tag	.2fake;	.size	32;	.type	0x18;	.endef
	.def	out;	.val	6;	.scl	17;	.tag	.2fake;	.size	32;	.type	0x18;	.endef
$Lb0:
	.begin	$Lb0	1
	.def	i;	.val	5;	.scl	4;	.type	0x4;	.endef
	.def	j;	.val	13;	.scl	4;	.type	0x4;	.endef
	.def	k;	.val	9;	.scl	4;	.type	0x4;	.endef
	subu	$sp,$sp,16
	sw	$16,0($sp)
	move	$16,$4
	sw	$17,4($sp)
	move	$17,$5

	.loc	1 24
LM13:
	move	$5,$0
	move	$25,$17
	move	$24,$16
	move	$15,$6
	move	$14,$5

	.loc	1 22
LM14:
	sw	$18,8($sp)
$L7:

	.loc	1 25
LM15:
	move	$13,$0
	move	$12,$14
	move	$11,$13
$L11:

	.loc	1 26
LM16:
$Lb1:
	.begin	$Lb1	5
	.def	sum;	.val	10;	.scl	4;	.type	0x5;	.endef
	move	$10,$0

	.loc	1 27
LM17:
	move	$9,$10
	move	$8,$11
	move	$7,$14
$L15:

	.loc	1 28
LM18:
	addu	$2,$16,$7
	addu	$3,$17,$8
	lh	$4,0($2)
	lh	$2,0($3)
	#nop
	mult	$4,$2

	.loc	1 27
LM19:
	addu	$8,$8,6
	addu	$7,$7,2
	addu	$9,$9,1
	slt	$2,$9,3

	.loc	1 28
LM20:
	mflo	$18

	.loc	1 27
LM21:
	#nop
	.set	noreorder
	.set	nomacro
	bne	$2,$0,$L15
	addu	$10,$10,$18
	.set	macro
	.set	reorder


	.loc	1 29
LM22:
$Le2:
	.bend	$Le2	8
	addu	$2,$6,$12
	sra	$3,$10,12
	sh	$3,0($2)

	.loc	1 25
LM23:
	addu	$12,$12,2
	addu	$13,$13,1
	slt	$2,$13,3
	.set	noreorder
	.set	nomacro
	bne	$2,$0,$L11
	addu	$11,$11,2
	.set	macro
	.set	reorder


	.loc	1 31
LM24:
	lw	$3,20($25)

	.loc	1 24
LM25:
	addu	$25,$25,4

	.loc	1 31
LM26:
	lw	$2,20($24)

	.loc	1 24
LM27:
	addu	$24,$24,4
	addu	$14,$14,6
	addu	$5,$5,1

	.loc	1 31
LM28:
	addu	$2,$2,$3
	sw	$2,20($15)

	.loc	1 24
LM29:
	slt	$2,$5,3
	.set	noreorder
	.set	nomacro
	bne	$2,$0,$L7
	addu	$15,$15,4
	.set	macro
	.set	reorder


	.loc	1 33
LM30:
$Le3:
	.bend	$Le3	12
	lw	$18,8($sp)
	lw	$17,4($sp)
	lw	$16,0($sp)
	#nop
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$sp,$sp,16
	.set	macro
	.set	reorder


	.loc	1 33
LM31:
	.end	compose
	.def	project;	.val	project;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 35
LM32:

	.loc	1 35
LM33:
	.ent	project
project:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	v;	.val	4;	.scl	17;	.tag	.0fake;	.size	8;	.type	0x18;	.endef
	.def	h;	.val	3;	.scl	17;	.type	0x4;	.endef
	move	$3,$5
	lh	$5,4($4)
	#nop
	beq	$5,$0,$L20
	lh	$2,0($4)
	#nop
	mult	$2,$3
	mflo	$3
	#nop
	#nop
	div	$5,$3,$5
	.set	noreorder
	.set	nomacro
	j	$31
	move	$2,$5
	.set	macro
	.set	reorder

$L20:
	move	$5,$0
	move	$2,$5
	j	$31

	.loc	1 35
LM34:
	.end	project
