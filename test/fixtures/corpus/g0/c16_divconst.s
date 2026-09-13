	.file	1 "c16_divconst.c"
gcc2_compiled.:
__gnu_compiled_c:
	.text
	.align	2
	.globl	div3
	.ent	div3
div3:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	li	$2,1431633920			# 0x55550000
	ori	$2,$2,0x5556
	mult	$4,$2
	sra	$4,$4,31
	mfhi	$3
	#nop
	.set	noreorder
	.set	nomacro
	j	$31
	subu	$2,$3,$4
	.set	macro
	.set	reorder

	.end	div3
	.align	2
	.globl	udiv10
	.ent	udiv10
udiv10:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	li	$2,-858993459			# 0xcccccccd
	multu	$4,$2
	mfhi	$3
	#nop
	.set	noreorder
	.set	nomacro
	j	$31
	srl	$2,$3,3
	.set	macro
	.set	reorder

	.end	udiv10
	.align	2
	.globl	div_pow2
	.ent	div_pow2
div_pow2:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.set	noreorder
	.set	nomacro
	bgez	$4,$L4
	move	$2,$4
	.set	macro
	.set	reorder

	addu	$2,$4,15
$L4:
	move	$3,$4
	.set	noreorder
	.set	nomacro
	bgez	$4,$L5
	sra	$5,$2,4
	.set	macro
	.set	reorder

	addu	$3,$4,7
$L5:
	sra	$2,$3,3
	sll	$2,$2,3
	subu	$2,$4,$2
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$2,$5,$2
	.set	macro
	.set	reorder

	.end	div_pow2
	.align	2
	.globl	umod_pow2
	.ent	umod_pow2
umod_pow2:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.set	noreorder
	.set	nomacro
	j	$31
	andi	$2,$4,0x001f
	.set	macro
	.set	reorder

	.end	umod_pow2
	.align	2
	.globl	mod7
	.ent	mod7
mod7:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	li	$2,-1840709632			# 0x92490000
	ori	$2,$2,0x2493
	mult	$4,$2
	sra	$2,$4,31
	mfhi	$5
	#nop
	#nop
	addu	$3,$5,$4
	sra	$3,$3,2
	subu	$3,$3,$2
	sll	$2,$3,3
	subu	$2,$2,$3
	.set	noreorder
	.set	nomacro
	j	$31
	subu	$2,$4,$2
	.set	macro
	.set	reorder

	.end	mod7
	.align	2
	.globl	div_neg
	.ent	div_neg
div_neg:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	bgez	$4,$L9
	addu	$4,$4,3
$L9:
	sra	$2,$4,2
	.set	noreorder
	.set	nomacro
	j	$31
	subu	$2,$0,$2
	.set	macro
	.set	reorder

	.end	div_neg
	.align	2
	.globl	scale_ratio
	.ent	scale_ratio
scale_ratio:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	li	$2,954400768			# 0x38e30000
	ori	$2,$2,0x8e39
	sll	$3,$4,2
	addu	$3,$3,$4
	mult	$3,$2
	sra	$3,$3,31
	mfhi	$5
	#nop
	#nop
	sra	$2,$5,1
	.set	noreorder
	.set	nomacro
	j	$31
	subu	$2,$2,$3
	.set	macro
	.set	reorder

	.end	scale_ratio

	.text
