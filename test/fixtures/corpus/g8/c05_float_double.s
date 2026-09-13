	.file	1 "c05_float_double.c"
gcc2_compiled.:
__gnu_compiled_c:
	.text
	.align	2
	.globl	scale
	.align	2
	.globl	blend
	.align	2
	.globl	to_fixed
	.align	2
	.globl	from_fixed
	.align	2
	.globl	clamp_unit
	.align	2
	.globl	constants
	.align	2
	.globl	float_equal
	.align	2
	.globl	round_positive

	.text
	.text
	.ent	scale
scale:
	.frame	$sp,24,$31		# vars= 0, regs= 1/0, args= 16, extra= 0
	.mask	0x80000000,-8
	.fmask	0x00000000,0
	subu	$sp,$sp,24
	sw	$31,16($sp)
	jal	__mulsf3
	li.s	$5,5.00000000000000000000e-1
	.set	noreorder
	.set	nomacro
	jal	__addsf3
	move	$4,$2
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

	.end	scale
	.text
	.ent	blend
blend:
	.frame	$sp,40,$31		# vars= 0, regs= 5/0, args= 16, extra= 0
	.mask	0x800f0000,-8
	.fmask	0x00000000,0
	subu	$sp,$sp,40
	sw	$19,28($sp)
	sw	$18,24($sp)
	move	$18,$4
	move	$19,$5
	move	$4,$6
	move	$5,$7
	sw	$17,20($sp)
	sw	$16,16($sp)
	lw	$16,56($sp)
	lw	$17,60($sp)
	move	$6,$18
	sw	$31,32($sp)
	.set	noreorder
	.set	nomacro
	jal	__subdf3
	move	$7,$19
	.set	macro
	.set	reorder

	move	$4,$2
	move	$5,$3
	move	$6,$16
	.set	noreorder
	.set	nomacro
	jal	__muldf3
	move	$7,$17
	.set	macro
	.set	reorder

	move	$4,$18
	move	$5,$19
	move	$6,$2
	.set	noreorder
	.set	nomacro
	jal	__adddf3
	move	$7,$3
	.set	macro
	.set	reorder

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

	.end	blend
	.text
	.ent	to_fixed
to_fixed:
	.frame	$sp,24,$31		# vars= 0, regs= 1/0, args= 16, extra= 0
	.mask	0x80000000,-8
	.fmask	0x00000000,0
	li.d	$6,4.09600000000000000000e3
	subu	$sp,$sp,24
	sw	$31,16($sp)
	jal	__muldf3
	move	$4,$2
	.set	noreorder
	.set	nomacro
	jal	__fixdfsi
	move	$5,$3
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

	.end	to_fixed
	.text
	.ent	from_fixed
from_fixed:
	.frame	$sp,24,$31		# vars= 0, regs= 1/0, args= 16, extra= 0
	.mask	0x80000000,-8
	.fmask	0x00000000,0
	subu	$sp,$sp,24
	sw	$31,16($sp)
	jal	__floatsidf
	li.d	$6,2.44140625000000000000e-4
	move	$4,$2
	.set	noreorder
	.set	nomacro
	jal	__muldf3
	move	$5,$3
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

	.end	from_fixed
	.text
	.ent	clamp_unit
clamp_unit:
	.frame	$sp,32,$31		# vars= 0, regs= 3/0, args= 16, extra= 0
	.mask	0x80030000,-8
	.fmask	0x00000000,0
	subu	$sp,$sp,32
	sw	$17,20($sp)
	move	$17,$4
	sw	$16,16($sp)
	move	$16,$0
	sw	$31,24($sp)
	.set	noreorder
	.set	nomacro
	jal	__ltsf2
	move	$5,$16
	.set	macro
	.set	reorder

	.set	noreorder
	.set	nomacro
	bltz	$2,$L6
	move	$4,$17
	.set	macro
	.set	reorder

	li.s	$16,1.00000000000000000000e0
	.set	noreorder
	.set	nomacro
	jal	__gtsf2
	move	$5,$16
	.set	macro
	.set	reorder

	move	$3,$2
	.set	noreorder
	.set	nomacro
	bgtz	$3,$L8
	move	$2,$16
	.set	macro
	.set	reorder

	.set	noreorder
	.set	nomacro
	j	$L8
	move	$2,$17
	.set	macro
	.set	reorder

$L6:
	move	$2,$16
$L8:
	lw	$31,24($sp)
	lw	$17,20($sp)
	lw	$16,16($sp)
	#nop
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$sp,$sp,32
	.set	macro
	.set	reorder

	.end	clamp_unit
	.text
	.ent	constants
constants:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	li	$2,1			# 0x00000001
	.set	noreorder
	.set	nomacro
	beq	$4,$2,$L12
	slt	$2,$4,2
	.set	macro
	.set	reorder

	.set	noreorder
	.set	nomacro
	beq	$2,$0,$L16
	li	$2,2			# 0x00000002
	.set	macro
	.set	reorder

	beq	$4,$0,$L11
	j	$L14
$L16:
	beq	$4,$2,$L13
	j	$L14
$L11:
	li.d	$2,3.14159265358979000737e0
	j	$31
$L12:
	li.d	$2,-2.50000000000000005204e-3
	j	$31
$L13:
	li.d	$2,1.00000000000000000000e10
	j	$31
$L14:
	move	$2,$0
	move	$3,$0
	j	$31
	.end	constants
	.text
	.ent	float_equal
float_equal:
	.frame	$sp,24,$31		# vars= 0, regs= 1/0, args= 16, extra= 0
	.mask	0x80000000,-8
	.fmask	0x00000000,0
	subu	$sp,$sp,24
	sw	$31,16($sp)
	jal	__eqsf2
	lw	$31,16($sp)
	sltu	$2,$2,1
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$sp,$sp,24
	.set	macro
	.set	reorder

	.end	float_equal
	.text
	.ent	round_positive
round_positive:
	.frame	$sp,24,$31		# vars= 0, regs= 1/0, args= 16, extra= 0
	.mask	0x80000000,-8
	.fmask	0x00000000,0
	li.d	$6,5.00000000000000000000e-1
	subu	$sp,$sp,24
	sw	$31,16($sp)
	jal	__adddf3
	move	$4,$2
	.set	noreorder
	.set	nomacro
	jal	__fixunsdfsi
	move	$5,$3
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

	.end	round_positive
