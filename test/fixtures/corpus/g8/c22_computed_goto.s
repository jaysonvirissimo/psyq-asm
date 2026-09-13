	.file	1 "c22_computed_goto.c"
gcc2_compiled.:
__gnu_compiled_c:
	.data
	.align	2
table.2:
	.word	$L2
	.word	$L3
	.word	$L4
	.word	$L5
	.text
	.align	2
	.globl	dispatch
	.data
	.align	2
ops.5:
	.word	$L7
	.word	$L8
	.word	$L9
	.text
	.align	2
	.globl	interpreter

	.text
	.text
	.ent	dispatch
dispatch:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	lui	$2,%hi(table.2) # high
	addiu	$2,$2,%lo(table.2) # low
	andi	$4,$4,0x0003
	sll	$4,$4,2
	addu	$4,$4,$2
	lw	$2,0($4)
	#nop
	j	$2
$L2:
	.set	noreorder
	.set	nomacro
	j	$L5
	addu	$5,$5,1
	.set	macro
	.set	reorder

$L3:
	.set	noreorder
	.set	nomacro
	j	$L5
	addu	$5,$5,-1
	.set	macro
	.set	reorder

$L4:
	subu	$5,$0,$5
$L5:
	.set	noreorder
	.set	nomacro
	j	$31
	move	$2,$5
	.set	macro
	.set	reorder

	.end	dispatch
	.text
	.ent	interpreter
interpreter:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	move	$6,$4
	lbu	$3,0($6)
	li	$2,-1431655765			# 0xaaaaaaab
	multu	$3,$2
	move	$7,$0
	lui	$5,%hi(ops.5) # high
	addiu	$5,$5,%lo(ops.5) # low
	mfhi	$8
	#nop
	#nop
	srl	$4,$8,1
	sll	$2,$4,1
	addu	$2,$2,$4
	subu	$3,$3,$2
	andi	$3,$3,0x00ff
	sll	$3,$3,2
	addu	$3,$3,$5
	lw	$2,0($3)
	#nop
	.set	noreorder
	.set	nomacro
	j	$2
	addu	$6,$6,1
	.set	macro
	.set	reorder

$L8:
	lbu	$3,0($6)
	li	$2,-1431655765			# 0xaaaaaaab
	multu	$3,$2
	addu	$7,$7,1
	lui	$5,%hi(ops.5) # high
	addiu	$5,$5,%lo(ops.5) # low
	mfhi	$8
	#nop
	#nop
	srl	$4,$8,1
	sll	$2,$4,1
	addu	$2,$2,$4
	subu	$3,$3,$2
	andi	$3,$3,0x00ff
	sll	$3,$3,2
	addu	$3,$3,$5
	lw	$2,0($3)
	#nop
	.set	noreorder
	.set	nomacro
	j	$2
	addu	$6,$6,1
	.set	macro
	.set	reorder

$L9:
	lbu	$3,0($6)
	li	$2,-1431655765			# 0xaaaaaaab
	multu	$3,$2
	sll	$7,$7,1
	lui	$5,%hi(ops.5) # high
	addiu	$5,$5,%lo(ops.5) # low
	mfhi	$8
	#nop
	#nop
	srl	$4,$8,1
	sll	$2,$4,1
	addu	$2,$2,$4
	subu	$3,$3,$2
	andi	$3,$3,0x00ff
	sll	$3,$3,2
	addu	$3,$3,$5
	lw	$2,0($3)
	#nop
	.set	noreorder
	.set	nomacro
	j	$2
	addu	$6,$6,1
	.set	macro
	.set	reorder

$L7:
	.set	noreorder
	.set	nomacro
	j	$31
	move	$2,$7
	.set	macro
	.set	reorder

	.end	interpreter
