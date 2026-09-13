	.file	1 "c19_conditions.c"
gcc2_compiled.:
__gnu_compiled_c:
	.text
	.align	2
	.globl	min3
	.ent	min3
min3:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
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

	.end	min3
	.align	2
	.globl	clamp
	.ent	clamp
clamp:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
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

	.end	clamp
	.align	2
	.globl	all_positive
	.ent	all_positive
all_positive:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
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
	.end	all_positive
	.align	2
	.globl	any_zero
	.ent	any_zero
any_zero:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
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
	.end	any_zero
	.align	2
	.globl	sign
	.ent	sign
sign:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	srl	$2,$4,31
	slt	$4,$0,$4
	.set	noreorder
	.set	nomacro
	j	$31
	subu	$2,$4,$2
	.set	macro
	.set	reorder

	.end	sign
	.align	2
	.globl	select_u
	.ent	select_u
select_u:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.set	noreorder
	.set	nomacro
	beq	$6,$0,$L22
	move	$2,$5
	.set	macro
	.set	reorder

	move	$2,$4
$L22:
	j	$31
	.end	select_u
	.align	2
	.globl	abs_diff
	.ent	abs_diff
abs_diff:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
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
	.end	abs_diff

	.text
