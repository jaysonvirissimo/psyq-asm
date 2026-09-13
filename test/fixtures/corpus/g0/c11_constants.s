	.file	1 "c11_constants.c"
gcc2_compiled.:
__gnu_compiled_c:
	.text
	.align	2
	.globl	ack_interrupts
	.ent	ack_interrupts
ack_interrupts:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	li	$5,528482304			# 0x1f800000
	ori	$5,$5,0x1070
	li	$6,528482304			# 0x1f800000
	ori	$6,$6,0x1074
	#.set	volatile
	lw	$2,0($5)
	#.set	novolatile
	nor	$3,$0,$4
	#.set	volatile
	sw	$3,0($5)
	#.set	novolatile
	#.set	volatile
	lw	$3,0($6)
	#.set	novolatile
	#nop
	or	$3,$3,$4
	#.set	volatile
	sw	$3,0($6)
	#.set	novolatile
	j	$31
	.end	ack_interrupts
	.align	2
	.globl	gpu_write
	.ent	gpu_write
gpu_write:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	li	$2,528482304			# 0x1f800000
	ori	$2,$2,0x1810
	#.set	volatile
	sw	$4,0($2)
	#.set	novolatile
	j	$31
	.end	gpu_write
	.align	2
	.globl	magic
	.ent	magic
magic:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	andi	$4,$4,0x0003
	li	$2,1			# 0x00000001
	.set	noreorder
	.set	nomacro
	beq	$4,$2,$L6
	slt	$2,$4,2
	.set	macro
	.set	reorder

	beq	$2,$0,$L10
	beq	$4,$0,$L5
	.set	noreorder
	.set	nomacro
	j	$L12
	li	$2,2147418112			# 0x7fff0000
	.set	macro
	.set	reorder

$L10:
	li	$2,2			# 0x00000002
	.set	noreorder
	.set	nomacro
	beq	$4,$2,$L7
	li	$2,2147418112			# 0x7fff0000
	.set	macro
	.set	reorder

	j	$L12
$L5:
	li	$2,-559087616			# 0xdead0000
	.set	noreorder
	.set	nomacro
	j	$31
	ori	$2,$2,0xbeef
	.set	macro
	.set	reorder

$L6:
	.set	noreorder
	.set	nomacro
	j	$31
	li	$2,32768			# 0x00008000
	.set	macro
	.set	reorder

$L7:
	.set	noreorder
	.set	nomacro
	j	$31
	li	$2,65535			# 0x0000ffff
	.set	macro
	.set	reorder

$L12:
	.set	noreorder
	.set	nomacro
	j	$31
	ori	$2,$2,0xffff
	.set	macro
	.set	reorder

	.end	magic
	.align	2
	.globl	negative
	.ent	negative
negative:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	li	$2,-131072			# 0xfffe0000
	.set	noreorder
	.set	nomacro
	j	$31
	ori	$2,$2,0xdcbb
	.set	macro
	.set	reorder

	.end	negative
	.align	2
	.globl	masks
	.ent	masks
masks:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	li	$2,-16777216			# 0xff000000
	ori	$2,$2,0xfff0
	and	$2,$4,$2
	.set	noreorder
	.set	nomacro
	j	$31
	ori	$2,$2,0x8001
	.set	macro
	.set	reorder

	.end	masks
	.align	2
	.globl	in_range
	.ent	in_range
in_range:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	li	$2,32768			# 0x00008000
	addu	$4,$4,$2
	li	$2,65535			# 0x0000ffff
	sltu	$2,$2,$4
	.set	noreorder
	.set	nomacro
	j	$31
	xori	$2,$2,0x0001
	.set	macro
	.set	reorder

	.end	in_range

	.text
