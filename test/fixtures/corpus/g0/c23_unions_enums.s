	.file	1 "c23_unions_enums.c"
gcc2_compiled.:
__gnu_compiled_c:
	.text
	.align	2
	.globl	describe
	.ent	describe
describe:
	.frame	$sp,24,$31		# vars= 0, regs= 1/0, args= 16, extra= 0
	.mask	0x80000000,-8
	.fmask	0x00000000,0
	subu	$sp,$sp,24
	sw	$31,16($sp)
	lw	$3,0($4)
	li	$2,5			# 0x00000005
	.set	noreorder
	.set	nomacro
	beq	$3,$2,$L4
	sltu	$2,$3,6
	.set	macro
	.set	reorder

	.set	noreorder
	.set	nomacro
	beq	$2,$0,$L8
	li	$2,4			# 0x00000004
	.set	macro
	.set	reorder

	.set	noreorder
	.set	nomacro
	beq	$3,$2,$L3
	li	$2,-1			# 0xffffffff
	.set	macro
	.set	reorder

	j	$L9
$L8:
	li	$2,100			# 0x00000064
	beq	$3,$2,$L5
	.set	noreorder
	.set	nomacro
	j	$L6
	li	$2,-1			# 0xffffffff
	.set	macro
	.set	reorder

$L3:
	lw	$2,4($4)
	j	$L9
$L4:
	lw	$4,4($4)
	jal	__fixsfsi
	j	$L9
$L5:
	lw	$2,4($4)
	#nop
	sltu	$2,$0,$2
$L6:
$L9:
	lw	$31,16($sp)
	#nop
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$sp,$sp,24
	.set	macro
	.set	reorder

	.end	describe
	.align	2
	.globl	bytes_of
	.ent	bytes_of
bytes_of:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	andi	$2,$4,0x00ff
	srl	$4,$4,24
	sll	$4,$4,24
	.set	noreorder
	.set	nomacro
	j	$31
	or	$2,$2,$4
	.set	macro
	.set	reorder

	.end	bytes_of
	.align	2
	.globl	kind_size
	.ent	kind_size
kind_size:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	sltu	$2,$0,$4
	.set	noreorder
	.set	nomacro
	j	$31
	sll	$2,$2,2
	.set	macro
	.set	reorder

	.end	kind_size

	.text
