	.file	1 "c09_recursion.c"
gcc2_compiled.:
__gnu_compiled_c:
	.text
	.align	2
	.globl	fib
	.ent	fib
fib:
	.frame	$sp,24,$31		# vars= 0, regs= 2/0, args= 16, extra= 0
	.mask	0x80010000,-4
	.fmask	0x00000000,0
	subu	$sp,$sp,24
	sw	$16,16($sp)
	move	$16,$4
	slt	$2,$16,2
	.set	noreorder
	.set	nomacro
	bne	$2,$0,$L2
	sw	$31,20($sp)
	.set	macro
	.set	reorder

	.set	noreorder
	.set	nomacro
	jal	fib
	addu	$4,$16,-1
	.set	macro
	.set	reorder

	addu	$4,$16,-2
	.set	noreorder
	.set	nomacro
	jal	fib
	move	$16,$2
	.set	macro
	.set	reorder

	.set	noreorder
	.set	nomacro
	j	$L3
	addu	$2,$16,$2
	.set	macro
	.set	reorder

$L2:
	move	$2,$16
$L3:
	lw	$31,20($sp)
	lw	$16,16($sp)
	#nop
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$sp,$sp,24
	.set	macro
	.set	reorder

	.end	fib
	.align	2
	.globl	ackermann
	.ent	ackermann
ackermann:
	.frame	$sp,24,$31		# vars= 0, regs= 2/0, args= 16, extra= 0
	.mask	0x80010000,-4
	.fmask	0x00000000,0
	subu	$sp,$sp,24
	move	$2,$5
	sw	$31,20($sp)
	sw	$16,16($sp)
$L7:
	bne	$4,$0,$L5
	.set	noreorder
	.set	nomacro
	j	$L8
	addu	$2,$2,1
	.set	macro
	.set	reorder

$L5:
	.set	noreorder
	.set	nomacro
	bne	$2,$0,$L6
	addu	$16,$4,-1
	.set	macro
	.set	reorder

	addu	$4,$4,-1
	.set	noreorder
	.set	nomacro
	j	$L7
	li	$2,1			# 0x00000001
	.set	macro
	.set	reorder

$L6:
	.set	noreorder
	.set	nomacro
	jal	ackermann
	addu	$5,$2,-1
	.set	macro
	.set	reorder

	.set	noreorder
	.set	nomacro
	j	$L7
	move	$4,$16
	.set	macro
	.set	reorder

$L8:
	lw	$31,20($sp)
	lw	$16,16($sp)
	#nop
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$sp,$sp,24
	.set	macro
	.set	reorder

	.end	ackermann
	.align	2
	.globl	tree_sum
	.ent	tree_sum
tree_sum:
	.frame	$sp,32,$31		# vars= 0, regs= 3/0, args= 16, extra= 0
	.mask	0x80030000,-8
	.fmask	0x00000000,0
	subu	$sp,$sp,32
	sw	$17,20($sp)
	move	$17,$4
	sw	$31,24($sp)
	.set	noreorder
	.set	nomacro
	beq	$17,$0,$L10
	sw	$16,16($sp)
	.set	macro
	.set	reorder

	lw	$4,0($17)
	jal	tree_sum
	lw	$4,4($17)
	.set	noreorder
	.set	nomacro
	jal	tree_sum
	move	$16,$2
	.set	macro
	.set	reorder

	lw	$3,8($17)
	#nop
	addu	$3,$3,$16
	.set	noreorder
	.set	nomacro
	j	$L11
	addu	$2,$3,$2
	.set	macro
	.set	reorder

$L10:
	move	$2,$0
$L11:
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

	.end	tree_sum
	.align	2
	.ent	gcd_static
gcd_static:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
$L14:
	beq	$5,$0,$L13
	rem	$2,$4,$5
	move	$4,$5
	.set	noreorder
	.set	nomacro
	j	$L14
	move	$5,$2
	.set	macro
	.set	reorder

$L13:
	.set	noreorder
	.set	nomacro
	j	$31
	move	$2,$4
	.set	macro
	.set	reorder

	.end	gcd_static
	.align	2
	.globl	lcm
	.ent	lcm
lcm:
	.frame	$sp,32,$31		# vars= 0, regs= 3/0, args= 16, extra= 0
	.mask	0x80030000,-8
	.fmask	0x00000000,0
	subu	$sp,$sp,32
	sw	$16,16($sp)
	move	$16,$4
	sw	$17,20($sp)
	sw	$31,24($sp)
	.set	noreorder
	.set	nomacro
	jal	gcd_static
	move	$17,$5
	.set	macro
	.set	reorder

	div	$16,$16,$2
	mult	$16,$17
	lw	$31,24($sp)
	lw	$17,20($sp)
	lw	$16,16($sp)
	mflo	$2
	#nop
	#nop
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$sp,$sp,32
	.set	macro
	.set	reorder

	.end	lcm

	.text
