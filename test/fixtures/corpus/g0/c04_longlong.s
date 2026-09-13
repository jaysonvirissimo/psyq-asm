	.file	1 "c04_longlong.c"
gcc2_compiled.:
__gnu_compiled_c:
	.text
	.align	2
	.globl	ll_add
	.ent	ll_add
ll_add:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	addu	$2,$4,$6
	sltu	$8,$2,$6
	addu	$3,$5,$7
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$3,$3,$8
	.set	macro
	.set	reorder

	.end	ll_add
	.align	2
	.globl	ll_mul
	.ent	ll_mul
ll_mul:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	multu	$4,$6
	mfhi	$3
	mflo	$2
	#nop
	#nop
	mult	$4,$7
	mflo	$9
	#nop
	#nop
	mult	$6,$5
	addu	$3,$3,$9
	mflo	$4
	#nop
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$3,$3,$4
	.set	macro
	.set	reorder

	.end	ll_mul
	.align	2
	.globl	ll_div
	.ent	ll_div
ll_div:
	.frame	$sp,24,$31		# vars= 0, regs= 1/0, args= 16, extra= 0
	.mask	0x80000000,-8
	.fmask	0x00000000,0
	subu	$sp,$sp,24
	sw	$31,16($sp)
	jal	__divdi3
	lw	$31,16($sp)
	#nop
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$sp,$sp,24
	.set	macro
	.set	reorder

	.end	ll_div
	.align	2
	.globl	ull_mod
	.ent	ull_mod
ull_mod:
	.frame	$sp,24,$31		# vars= 0, regs= 1/0, args= 16, extra= 0
	.mask	0x80000000,-8
	.fmask	0x00000000,0
	subu	$sp,$sp,24
	sw	$31,16($sp)
	jal	__umoddi3
	lw	$31,16($sp)
	#nop
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$sp,$sp,24
	.set	macro
	.set	reorder

	.end	ull_mod
	.align	2
	.globl	ll_shift
	.ent	ll_shift
ll_shift:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	sll	$2,$6,26
	bgez	$2,1f
	sll	$9,$4,$6
	.set	noreorder
	b	3f
	move	$8,$0
	.set	reorder

1:
	.set	noreorder
	beq	$2,$0,2f
	sll	$9,$5,$6
	.set	reorder

	subu	$2,$0,$6
	srl	$2,$4,$2
	or	$9,$9,$2
2:
	sll	$8,$4,$6
3:
	andi	$6,$6,0x0007
	sll	$7,$6,26
	bgez	$7,1f
	sra	$2,$5,$6
	.set	noreorder
	b	3f
	sra	$3,$5,31
	.set	reorder

1:
	.set	noreorder
	beq	$7,$0,2f
	srl	$2,$4,$6
	.set	reorder

	subu	$7,$0,$6
	sll	$7,$5,$7
	or	$2,$2,$7
2:
	sra	$3,$5,$6
3:
	xor	$2,$8,$2
	.set	noreorder
	.set	nomacro
	j	$31
	xor	$3,$9,$3
	.set	macro
	.set	reorder

	.end	ll_shift
	.align	2
	.globl	ll_compare
	.ent	ll_compare
ll_compare:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	slt	$2,$5,$7
	.set	noreorder
	.set	nomacro
	bne	$2,$0,$L12
	li	$3,-1			# 0xffffffff
	.set	macro
	.set	reorder

	.set	noreorder
	.set	nomacro
	bne	$7,$5,$L13
	slt	$2,$7,$5
	.set	macro
	.set	reorder

	sltu	$2,$4,$6
	.set	noreorder
	.set	nomacro
	bne	$2,$0,$L7
	slt	$2,$7,$5
	.set	macro
	.set	reorder

$L13:
	.set	noreorder
	.set	nomacro
	bne	$2,$0,$L11
	move	$3,$0
	.set	macro
	.set	reorder

	.set	noreorder
	.set	nomacro
	bne	$5,$7,$L8
	sltu	$2,$6,$4
	.set	macro
	.set	reorder

	beq	$2,$0,$L12
$L11:
	li	$3,1			# 0x00000001
$L7:
$L8:
$L12:
	.set	noreorder
	.set	nomacro
	j	$31
	move	$2,$3
	.set	macro
	.set	reorder

	.end	ll_compare
	.align	2
	.globl	widen
	.ent	widen
widen:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	li	$2,65536			# 0x00010000
	ori	$2,$2,0x86a0
	mult	$4,$2
	mfhi	$3
	mflo	$2
	#nop
	j	$31
	.end	widen

	.text
