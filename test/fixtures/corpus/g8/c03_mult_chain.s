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
	.text
	.ent	poly
poly:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
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

	.end	poly
	.text
	.ent	mixed_ops
mixed_ops:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	div	$4,$4,$5
	mfhi	$2
	addu	$2,$2,$6
	mult	$2,$4
	mflo	$2
	#nop
	j	$31
	.end	mixed_ops
	.text
	.ent	unsigned_ops
unsigned_ops:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	divu	$3,$4,$5
	mfhi	$2
	ori	$5,$5,0x0001
	divu	$4,$4,$5
	mult	$3,$2
	sll	$2,$4,1
	addu	$2,$2,$4
	mflo	$3
	#nop
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$2,$3,$2
	.set	macro
	.set	reorder

	.end	unsigned_ops
	.text
	.ent	matrix_trace
matrix_trace:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	move	$6,$0
	.set	noreorder
	.set	nomacro
	blez	$5,$L6
	move	$7,$6
	.set	macro
	.set	reorder

	move	$9,$6
$L8:
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
	bne	$6,$3,$L11
	lw	$2,0($8)
	#nop
	mult	$2,$2
	mflo	$10
	#nop
	#nop
	addu	$7,$7,$10
$L11:
	addu	$3,$3,1
	slt	$2,$3,$5
	bne	$2,$0,$L12
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
	.set	noreorder
	.set	nomacro
	j	$31
	move	$2,$7
	.set	macro
	.set	reorder

	.end	matrix_trace
	.text
	.ent	average
average:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	move	$6,$0
	.set	noreorder
	.set	nomacro
	blez	$5,$L18
	move	$3,$6
	.set	macro
	.set	reorder

$L20:
	lw	$2,0($4)
	addu	$6,$6,1
	addu	$3,$3,$2
	slt	$2,$6,$5
	.set	noreorder
	.set	nomacro
	bne	$2,$0,$L20
	addu	$4,$4,4
	.set	macro
	.set	reorder

$L18:
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
	move	$2,$5
	j	$31
	.end	average
	.text
	.ent	hash_step
hash_step:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	li	$2,-2043215872			# 0x86370000
	ori	$2,$2,0xa2a3
	sll	$6,$4,5
	subu	$6,$6,$4
	addu	$6,$6,$5
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

	.end	hash_step
