	.file	1 "c19_conditions.c"
gcc2_compiled.:
__gnu_compiled_c:
	.text
	.align	2
	.globl	min3
	.align	2
	.globl	clamp
	.align	2
	.globl	all_positive
	.align	2
	.globl	any_zero
	.align	2
	.globl	sign
	.align	2
	.globl	select_u
	.align	2
	.globl	abs_diff

	.text
	.def	min3;	.val	min3;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 4
LM1:

	.loc	1 4
LM2:
	.ent	min3
min3:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	a;	.val	4;	.scl	17;	.type	0x4;	.endef
	.def	b;	.val	5;	.scl	17;	.type	0x4;	.endef
	.def	c;	.val	6;	.scl	17;	.type	0x4;	.endef
	slt	$2,$4,$5
	.set	noreorder
	.set	nomacro
	beq	$2,$0,$L2
	slt	$2,$4,$6
	.set	macro
	.set	reorder

	beq	$2,$0,$L3
	.set	noreorder
	.set	nomacro
	j	$L3
	move	$6,$4
	.set	macro
	.set	reorder

$L2:
	slt	$2,$5,$6
	beq	$2,$0,$L3
	move	$6,$5
$L3:
	.set	noreorder
	.set	nomacro
	j	$31
	move	$2,$6
	.set	macro
	.set	reorder


	.loc	1 4
LM3:
	.end	min3
	.def	clamp;	.val	clamp;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 5
LM4:

	.loc	1 5
LM5:
	.ent	clamp
clamp:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	x;	.val	4;	.scl	17;	.type	0x4;	.endef
	.def	lo;	.val	5;	.scl	17;	.type	0x4;	.endef
	.def	hi;	.val	6;	.scl	17;	.type	0x4;	.endef
	slt	$2,$4,$5
	.set	noreorder
	.set	nomacro
	bne	$2,$0,$L8
	slt	$2,$6,$4
	.set	macro
	.set	reorder

	.set	noreorder
	.set	nomacro
	bne	$2,$0,$L8
	move	$5,$6
	.set	macro
	.set	reorder

	move	$5,$4
$L8:
	.set	noreorder
	.set	nomacro
	j	$31
	move	$2,$5
	.set	macro
	.set	reorder


	.loc	1 5
LM6:
	.end	clamp
	.def	all_positive;	.val	all_positive;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 6
LM7:

	.loc	1 6
LM8:
	.ent	all_positive
all_positive:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	a;	.val	4;	.scl	17;	.type	0x4;	.endef
	.def	b;	.val	5;	.scl	17;	.type	0x4;	.endef
	.def	c;	.val	6;	.scl	17;	.type	0x4;	.endef
	.set	noreorder
	.set	nomacro
	blez	$4,$L13
	move	$2,$0
	.set	macro
	.set	reorder

	blez	$5,$L13
	slt	$2,$2,$6
$L13:
	j	$31

	.loc	1 6
LM9:
	.end	all_positive
	.def	any_zero;	.val	any_zero;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 7
LM10:

	.loc	1 7
LM11:
	.ent	any_zero
any_zero:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	a;	.val	4;	.scl	17;	.type	0x4;	.endef
	.def	b;	.val	5;	.scl	17;	.type	0x4;	.endef
	.set	noreorder
	.set	nomacro
	beq	$4,$0,$L16
	move	$2,$0
	.set	macro
	.set	reorder

	bne	$5,$0,$L17
$L16:
	li	$2,1			# 0x00000001
$L17:
	j	$31

	.loc	1 7
LM12:
	.end	any_zero
	.def	sign;	.val	sign;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 8
LM13:

	.loc	1 8
LM14:
	.ent	sign
sign:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	x;	.val	4;	.scl	17;	.type	0x4;	.endef
	srl	$2,$4,31
	slt	$4,$0,$4
	.set	noreorder
	.set	nomacro
	j	$31
	subu	$2,$4,$2
	.set	macro
	.set	reorder


	.loc	1 8
LM15:
	.end	sign
	.def	select_u;	.val	select_u;	.scl	2;	.type	0x2e;	.endef
	.text

	.loc	1 9
LM16:

	.loc	1 9
LM17:
	.ent	select_u
select_u:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	a;	.val	4;	.scl	17;	.type	0xe;	.endef
	.def	b;	.val	5;	.scl	17;	.type	0xe;	.endef
	.def	flag;	.val	6;	.scl	17;	.type	0x4;	.endef
	.set	noreorder
	.set	nomacro
	beq	$6,$0,$L22
	move	$2,$5
	.set	macro
	.set	reorder

	move	$2,$4
$L22:
	j	$31

	.loc	1 9
LM18:
	.end	select_u
	.def	abs_diff;	.val	abs_diff;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 10
LM19:

	.loc	1 10
LM20:
	.ent	abs_diff
abs_diff:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	a;	.val	4;	.scl	17;	.type	0x4;	.endef
	.def	b;	.val	5;	.scl	17;	.type	0x4;	.endef
	slt	$2,$5,$4
	.set	noreorder
	.set	nomacro
	bne	$2,$0,$L26
	subu	$2,$4,$5
	.set	macro
	.set	reorder

	.set	noreorder
	.set	nomacro
	j	$31
	subu	$2,$5,$4
	.set	macro
	.set	reorder

$L26:
	j	$31

	.loc	1 10
LM21:
	.end	abs_diff
