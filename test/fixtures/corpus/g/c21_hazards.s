	.file	1 "c21_hazards.c"
gcc2_compiled.:
__gnu_compiled_c:
	.text
	.align	2
	.globl	load_then_branch
	.align	2
	.globl	load_then_shift
	.align	2
	.globl	mult_after_div
	.align	2
	.globl	rem_then_mult
	.align	2
	.globl	chained_loads
	.align	2
	.globl	loop_loads

	.text
	.def	State;	.scl	10;	.type	0x8;	.size	16;	.endef
	.def	a;	.val	0;	.scl	8;	.type	0x4;	.endef
	.def	b;	.val	4;	.scl	8;	.type	0x4;	.endef
	.def	c;	.val	8;	.scl	8;	.type	0x4;	.endef
	.def	s;	.val	12;	.scl	8;	.type	0x3;	.endef
	.def	u;	.val	14;	.scl	8;	.type	0xc;	.endef
	.def	.eos;	.val	16;	.scl	102;	.tag	State;	.size	16;	.endef
	.def	load_then_branch;	.val	load_then_branch;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 7
LM1:

	.loc	1 7
LM2:
	.ent	load_then_branch
load_then_branch:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	st;	.val	4;	.scl	17;	.tag	State;	.size	16;	.type	0x18;	.endef

	.loc	1 8
LM3:
	lw	$3,0($4)
	lw	$2,4($4)
	#nop
	slt	$2,$2,$3
	bne	$2,$0,$L2

	.loc	1 10
LM4:
	lh	$2,12($4)
	j	$31
$L2:

	.loc	1 9
LM5:
	lw	$2,8($4)
	j	$31

	.loc	1 10
LM6:
	.end	load_then_branch
	.def	load_then_shift;	.val	load_then_shift;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 13
LM7:

	.loc	1 13
LM8:
	.ent	load_then_shift
load_then_shift:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	st;	.val	4;	.scl	17;	.tag	State;	.size	16;	.type	0x18;	.endef
	lw	$3,0($4)
	lbu	$2,14($4)
	sll	$3,$3,3
	srl	$2,$2,1
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$2,$3,$2
	.set	macro
	.set	reorder


	.loc	1 13
LM9:
	.end	load_then_shift
	.def	mult_after_div;	.val	mult_after_div;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 16
LM10:

	.loc	1 16
LM11:
	.ent	mult_after_div
mult_after_div:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	a;	.val	4;	.scl	17;	.type	0x4;	.endef
	.def	b;	.val	5;	.scl	17;	.type	0x4;	.endef
	.def	c;	.val	6;	.scl	17;	.type	0x4;	.endef

	.loc	1 17
LM12:
$Lb0:
	.begin	$Lb0	2
$Le1:
	.bend	$Le1	2
	div	$2,$4,$5

	.loc	1 18
LM13:
	mult	$2,$6
	mflo	$3
	#nop
	#nop
	mult	$3,$2
	mflo	$2

	.loc	1 19
LM14:
	#nop
	j	$31

	.loc	1 19
LM15:
	.end	mult_after_div
	.def	rem_then_mult;	.val	rem_then_mult;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 21
LM16:

	.loc	1 21
LM17:
	.ent	rem_then_mult
rem_then_mult:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	a;	.val	4;	.scl	17;	.type	0xe;	.endef
	.def	b;	.val	5;	.scl	17;	.type	0xe;	.endef
	divu	$4,$4,$5
	mfhi	$2
	mult	$2,$4
	mflo	$2
	#nop
	j	$31

	.loc	1 21
LM18:
	.end	rem_then_mult
	.def	chained_loads;	.val	chained_loads;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 24
LM19:

	.loc	1 24
LM20:
	.ent	chained_loads
chained_loads:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	pp;	.val	4;	.scl	17;	.type	0x54;	.endef

	.loc	1 25
LM21:
$Lb2:
	.begin	$Lb2	2
	.def	p;	.val	2;	.scl	4;	.type	0x14;	.endef
	.def	v;	.val	3;	.scl	4;	.type	0x4;	.endef
$Le3:
	.bend	$Le3	2
	lw	$2,0($4)

	.loc	1 26
LM22:
	#nop
	lw	$3,0($2)

	.loc	1 27
LM23:
	lw	$2,4($2)

	.loc	1 28
LM24:
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$2,$3,$2
	.set	macro
	.set	reorder


	.loc	1 28
LM25:
	.end	chained_loads
	.def	loop_loads;	.val	loop_loads;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 31
LM26:

	.loc	1 31
LM27:
	.ent	loop_loads
loop_loads:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	p;	.val	4;	.scl	17;	.type	0x14;	.endef
	.def	n;	.val	3;	.scl	17;	.type	0x4;	.endef

	.loc	1 32
LM28:
$Lb4:
	.begin	$Lb4	2
	.def	s;	.val	2;	.scl	4;	.type	0x4;	.endef
	move	$2,$0

	.loc	1 33
LM29:
	.set	noreorder
	.set	nomacro
	beq	$5,$0,$L14
	addu	$3,$5,-1
	.set	macro
	.set	reorder

	li	$6,-1			# 0xffffffff
$L11:

	.loc	1 34
LM30:
$Lb5:
	.begin	$Lb5	4
	.def	v;	.val	5;	.scl	4;	.type	0x4;	.endef
	lw	$5,0($4)

	.loc	1 35
LM31:
	#nop
	.set	noreorder
	.set	nomacro
	beq	$5,$0,$L9
	addu	$4,$4,4
	.set	macro
	.set	reorder


	.loc	1 36
LM32:
	addu	$2,$2,$5

	.loc	1 37
LM33:
$Le6:
	.bend	$Le6	7
$L9:
	addu	$3,$3,-1
	bne	$3,$6,$L11

	.loc	1 39
LM34:
$Le7:
	.bend	$Le7	9
$L14:
	j	$31

	.loc	1 39
LM35:
	.end	loop_loads
