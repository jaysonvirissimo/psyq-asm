	.file	1 "c24_many_args.c"
gcc2_compiled.:
__gnu_compiled_c:
	.text
	.align	2
	.globl	pass_through
	.align	2
	.globl	stack_args
	.align	2
	.globl	mixed_args
	.align	2
	.globl	pass_struct
	.align	2
	.globl	return_struct

	.text
	.text
	.ent	pass_through
pass_through:
	.frame	$sp,40,$31		# vars= 0, regs= 1/0, args= 32, extra= 0
	.mask	0x80000000,-8
	.fmask	0x00000000,0
	subu	$sp,$sp,40
	move	$8,$6
	move	$6,$7
	lw	$3,56($sp)
	lw	$2,60($sp)
	move	$7,$8
	sw	$31,32($sp)
	sw	$5,16($sp)
	sw	$4,20($sp)
	addu	$4,$4,$2
	addu	$5,$5,$3
	sw	$4,24($sp)
	move	$4,$2
	sw	$5,28($sp)
	.set	noreorder
	.set	nomacro
	jal	sink
	move	$5,$3
	.set	macro
	.set	reorder

	lw	$31,32($sp)
	#nop
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$sp,$sp,40
	.set	macro
	.set	reorder

	.end	pass_through
	.text
	.ent	stack_args
stack_args:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	subu	$4,$4,$5
	addu	$4,$4,$6
	subu	$4,$4,$7
	lw	$2,16($sp)
	lw	$3,20($sp)
	addu	$4,$4,$2
	lw	$2,24($sp)
	subu	$4,$4,$3
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$2,$4,$2
	.set	macro
	.set	reorder

	.end	stack_args
	.text
	.ent	mixed_args
mixed_args:
	.frame	$sp,40,$31		# vars= 0, regs= 5/0, args= 16, extra= 0
	.mask	0x800f0000,-8
	.fmask	0x00000000,0
	subu	$sp,$sp,40
	sw	$18,24($sp)
	lw	$18,56($sp)
	sw	$19,28($sp)
	lw	$19,60($sp)
	sw	$17,20($sp)
	sw	$16,16($sp)
	move	$16,$6
	sw	$31,32($sp)
	.set	noreorder
	.set	nomacro
	jal	__floatsidf
	move	$17,$7
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

	move	$16,$2
	move	$17,$3
	.set	noreorder
	.set	nomacro
	jal	__floatsisf
	move	$4,$18
	.set	macro
	.set	reorder

	move	$4,$2
	.set	noreorder
	.set	nomacro
	jal	__mulsf3
	move	$5,$19
	.set	macro
	.set	reorder

	.set	noreorder
	.set	nomacro
	jal	__extendsfdf2
	move	$4,$2
	.set	macro
	.set	reorder

	move	$4,$16
	move	$5,$17
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

	.end	mixed_args
	.text
	.ent	pass_struct
pass_struct:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	lw	$3,36($sp)
	lw	$2,40($sp)
	sw	$4,0($sp)
	sw	$5,4($sp)
	sw	$6,8($sp)
	sw	$7,12($sp)
	addu	$4,$4,$3
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$2,$4,$2
	.set	macro
	.set	reorder

	.end	pass_struct
	.text
	.ent	return_struct
return_struct:
	.frame	$sp,40,$31		# vars= 40, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	subu	$sp,$sp,40
	move	$2,$4
	li	$6,9			# 0x00000009
	addu	$3,$sp,36
	addu	$5,$5,$6
$L9:
	sw	$5,0($3)
	addu	$3,$3,-4
	addu	$6,$6,-1
	.set	noreorder
	.set	nomacro
	bgez	$6,$L9
	addu	$5,$5,-1
	.set	macro
	.set	reorder

	move	$5,$2
	move	$3,$sp
	addu	$6,$sp,32
$L11:
	lw	$7,0($3)
	lw	$8,4($3)
	lw	$9,8($3)
	lw	$10,12($3)
	sw	$7,0($5)
	sw	$8,4($5)
	sw	$9,8($5)
	sw	$10,12($5)
	addu	$3,$3,16
	.set	noreorder
	.set	nomacro
	bne	$3,$6,$L11
	addu	$5,$5,16
	.set	macro
	.set	reorder

	lw	$7,0($3)
	lw	$8,4($3)
	sw	$7,0($5)
	sw	$8,4($5)
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$sp,$sp,40
	.set	macro
	.set	reorder

	.end	return_struct
