	.file	1 "c02_switch_sparse.c"
gcc2_compiled.:
__gnu_compiled_c:
	.text
	.align	2
	.globl	sparse_lookup
	.ent	sparse_lookup
sparse_lookup:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	li	$2,256			# 0x00000100
	.set	noreorder
	.set	nomacro
	beq	$4,$2,$L5
	slt	$2,$4,257
	.set	macro
	.set	reorder

	.set	noreorder
	.set	nomacro
	beq	$2,$0,$L13
	li	$2,3			# 0x00000003
	.set	macro
	.set	reorder

	.set	noreorder
	.set	nomacro
	beq	$4,$2,$L3
	slt	$2,$4,4
	.set	macro
	.set	reorder

	.set	noreorder
	.set	nomacro
	beq	$2,$0,$L14
	li	$2,-5			# 0xfffffffb
	.set	macro
	.set	reorder

	.set	noreorder
	.set	nomacro
	beq	$4,$2,$L8
	move	$2,$0
	.set	macro
	.set	reorder

	j	$L17
$L14:
	li	$2,17			# 0x00000011
	.set	noreorder
	.set	nomacro
	beq	$4,$2,$L4
	move	$2,$0
	.set	macro
	.set	reorder

	j	$L17
$L13:
	li	$2,4096			# 0x00001000
	.set	noreorder
	.set	nomacro
	beq	$4,$2,$L7
	slt	$2,$4,4097
	.set	macro
	.set	reorder

	.set	noreorder
	.set	nomacro
	beq	$2,$0,$L15
	li	$2,1000			# 0x000003e8
	.set	macro
	.set	reorder

	.set	noreorder
	.set	nomacro
	beq	$4,$2,$L6
	move	$2,$0
	.set	macro
	.set	reorder

	j	$L17
$L15:
	li	$2,65535			# 0x0000ffff
	.set	noreorder
	.set	nomacro
	beq	$4,$2,$L9
	li	$2,65536			# 0x00010000
	.set	macro
	.set	reorder

	ori	$2,$2,0x2345
	.set	noreorder
	.set	nomacro
	beq	$4,$2,$L10
	move	$2,$0
	.set	macro
	.set	reorder

	j	$L17
$L3:
	.set	noreorder
	.set	nomacro
	j	$31
	li	$2,30			# 0x0000001e
	.set	macro
	.set	reorder

$L4:
	.set	noreorder
	.set	nomacro
	j	$31
	li	$2,170			# 0x000000aa
	.set	macro
	.set	reorder

$L5:
	.set	noreorder
	.set	nomacro
	j	$31
	li	$2,2560			# 0x00000a00
	.set	macro
	.set	reorder

$L6:
	.set	noreorder
	.set	nomacro
	j	$31
	li	$2,1			# 0x00000001
	.set	macro
	.set	reorder

$L7:
	.set	noreorder
	.set	nomacro
	j	$31
	li	$2,2			# 0x00000002
	.set	macro
	.set	reorder

$L8:
	.set	noreorder
	.set	nomacro
	j	$31
	li	$2,50			# 0x00000032
	.set	macro
	.set	reorder

$L9:
	.set	noreorder
	.set	nomacro
	j	$31
	li	$2,3			# 0x00000003
	.set	macro
	.set	reorder

$L10:
	.set	noreorder
	.set	nomacro
	j	$31
	li	$2,4			# 0x00000004
	.set	macro
	.set	reorder

$L17:
	j	$31
	.end	sparse_lookup
	.align	2
	.globl	ranges
	.ent	ranges
ranges:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	srl	$4,$4,4
	li	$2,2			# 0x00000002
	.set	noreorder
	.set	nomacro
	beq	$4,$2,$L21
	sltu	$2,$4,3
	.set	macro
	.set	reorder

	.set	noreorder
	.set	nomacro
	beq	$2,$0,$L26
	li	$2,8			# 0x00000008
	.set	macro
	.set	reorder

	.set	noreorder
	.set	nomacro
	beq	$4,$0,$L20
	li	$2,122			# 0x0000007a
	.set	macro
	.set	reorder

	j	$L28
$L26:
	.set	noreorder
	.set	nomacro
	beq	$4,$2,$L22
	li	$2,32			# 0x00000020
	.set	macro
	.set	reorder

	.set	noreorder
	.set	nomacro
	beq	$4,$2,$L23
	li	$2,122			# 0x0000007a
	.set	macro
	.set	reorder

	j	$L28
$L20:
	.set	noreorder
	.set	nomacro
	j	$31
	li	$2,97			# 0x00000061
	.set	macro
	.set	reorder

$L21:
	.set	noreorder
	.set	nomacro
	j	$31
	li	$2,98			# 0x00000062
	.set	macro
	.set	reorder

$L22:
	.set	noreorder
	.set	nomacro
	j	$31
	li	$2,99			# 0x00000063
	.set	macro
	.set	reorder

$L23:
	.set	noreorder
	.set	nomacro
	j	$31
	li	$2,100			# 0x00000064
	.set	macro
	.set	reorder

$L28:
	j	$31
	.end	ranges

	.text
