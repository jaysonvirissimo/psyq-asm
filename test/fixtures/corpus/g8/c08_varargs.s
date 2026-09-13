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
	.text
	.ent	sum_ints
sum_ints:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	sw	$6,8($sp)
	move	$6,$0
	sw	$5,4($sp)
	addu	$5,$sp,4
	move	$2,$4
	sw	$4,0($sp)
	addu	$4,$4,-1
	.set	noreorder
	.set	nomacro
	blez	$2,$L3
	sw	$7,12($sp)
	.set	macro
	.set	reorder

$L4:
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
	.set	noreorder
	.set	nomacro
	j	$31
	move	$2,$6
	.set	macro
	.set	reorder

	.end	sum_ints
	.text
	.ent	max_of
max_of:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	sw	$5,4($sp)
	addu	$5,$sp,8
	sw	$4,0($sp)
	addu	$4,$4,-1
	sw	$6,8($sp)
	sw	$7,12($sp)
	lw	$6,-4($5)
	.set	noreorder
	.set	nomacro
	blez	$4,$L8
	addu	$5,$5,4
	.set	macro
	.set	reorder

$L12:
	lw	$3,-4($5)
	#nop
	slt	$2,$6,$3
	beq	$2,$0,$L7
	move	$6,$3
$L7:
	addu	$4,$4,-1
	.set	noreorder
	.set	nomacro
	bgtz	$4,$L12
	addu	$5,$5,4
	.set	macro
	.set	reorder

$L8:
	.set	noreorder
	.set	nomacro
	j	$31
	move	$2,$6
	.set	macro
	.set	reorder

	.end	max_of
	.text
	.ent	forward
forward:
	.frame	$sp,24,$31		# vars= 0, regs= 2/0, args= 16, extra= 0
	.mask	0x80010000,-4
	.fmask	0x00000000,0
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

	.end	forward
