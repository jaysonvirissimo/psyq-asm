	.file	1 "c21_hazards.c"
gcc2_compiled.:
__gnu_compiled_c:
	.text
	.align	2
	.globl	load_then_branch
	.align	2
	.globl	load_then_shift
	.align	2
	.globl	mult_after_div
	.align	2
	.globl	rem_then_mult
	.align	2
	.globl	chained_loads
	.align	2
	.globl	loop_loads

	.text
	.text
	.ent	load_then_branch
load_then_branch:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	lw	$3,0($4)
	lw	$2,4($4)
	#nop
	slt	$2,$2,$3
	bne	$2,$0,$L2
	lh	$2,12($4)
	j	$31
$L2:
	lw	$2,8($4)
	j	$31
	.end	load_then_branch
	.text
	.ent	load_then_shift
load_then_shift:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	lw	$3,0($4)
	lbu	$2,14($4)
	sll	$3,$3,3
	srl	$2,$2,1
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$2,$3,$2
	.set	macro
	.set	reorder

	.end	load_then_shift
	.text
	.ent	mult_after_div
mult_after_div:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	div	$2,$4,$5
	mult	$2,$6
	mflo	$3
	#nop
	#nop
	mult	$3,$2
	mflo	$2
	#nop
	j	$31
	.end	mult_after_div
	.text
	.ent	rem_then_mult
rem_then_mult:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	divu	$4,$4,$5
	mfhi	$2
	mult	$2,$4
	mflo	$2
	#nop
	j	$31
	.end	rem_then_mult
	.text
	.ent	chained_loads
chained_loads:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	lw	$2,0($4)
	#nop
	lw	$3,0($2)
	lw	$2,4($2)
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$2,$3,$2
	.set	macro
	.set	reorder

	.end	chained_loads
	.text
	.ent	loop_loads
loop_loads:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	move	$2,$0
	.set	noreorder
	.set	nomacro
	beq	$5,$0,$L14
	addu	$3,$5,-1
	.set	macro
	.set	reorder

	li	$6,-1			# 0xffffffff
$L11:
	lw	$5,0($4)
	#nop
	.set	noreorder
	.set	nomacro
	beq	$5,$0,$L9
	addu	$4,$4,4
	.set	macro
	.set	reorder

	addu	$2,$2,$5
$L9:
	addu	$3,$3,-1
	bne	$3,$6,$L11
$L14:
	j	$31
	.end	loop_loads
