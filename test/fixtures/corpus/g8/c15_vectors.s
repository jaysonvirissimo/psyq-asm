	.file	1 "c15_vectors.c"
gcc2_compiled.:
__gnu_compiled_c:
	.text
	.align	2
	.globl	cross
	.align	2
	.globl	length_squared
	.align	2
	.globl	compose
	.align	2
	.globl	project

	.text
	.text
	.ent	cross
cross:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	lh	$3,2($4)
	lh	$2,4($5)
	#nop
	mult	$3,$2
	lh	$3,4($4)
	mflo	$7
	#nop
	lh	$2,2($5)
	#nop
	mult	$3,$2
	mflo	$2
	#nop
	#nop
	subu	$2,$7,$2
	sw	$2,0($6)
	lh	$3,4($4)
	lh	$2,0($5)
	#nop
	mult	$3,$2
	lh	$3,0($4)
	mflo	$7
	#nop
	lh	$2,4($5)
	#nop
	mult	$3,$2
	mflo	$2
	#nop
	#nop
	subu	$2,$7,$2
	sw	$2,4($6)
	lh	$3,0($4)
	lh	$2,2($5)
	#nop
	mult	$3,$2
	lh	$3,2($4)
	mflo	$7
	#nop
	lh	$2,0($5)
	#nop
	mult	$3,$2
	mflo	$2
	#nop
	#nop
	subu	$2,$7,$2
	.set	noreorder
	.set	nomacro
	j	$31
	sw	$2,8($6)
	.set	macro
	.set	reorder

	.end	cross
	.text
	.ent	length_squared
length_squared:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	lw	$2,0($4)
	#nop
	sra	$2,$2,6
	mult	$2,$2
	lw	$2,4($4)
	mflo	$5
	#nop
	sra	$2,$2,6
	mult	$2,$2
	lw	$2,8($4)
	mflo	$3
	#nop
	sra	$2,$2,6
	mult	$2,$2
	addu	$2,$5,$3
	mflo	$7
	#nop
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$2,$2,$7
	.set	macro
	.set	reorder

	.end	length_squared
	.text
	.ent	compose
compose:
	.frame	$sp,16,$31		# vars= 0, regs= 3/0, args= 0, extra= 0
	.mask	0x00070000,-8
	.fmask	0x00000000,0
	subu	$sp,$sp,16
	sw	$16,0($sp)
	move	$16,$4
	sw	$17,4($sp)
	move	$17,$5
	move	$5,$0
	move	$25,$17
	move	$24,$16
	move	$15,$6
	move	$14,$5
	sw	$18,8($sp)
$L7:
	move	$13,$0
	move	$12,$14
	move	$11,$13
$L11:
	move	$10,$0
	move	$9,$10
	move	$8,$11
	move	$7,$14
$L15:
	addu	$2,$16,$7
	addu	$3,$17,$8
	lh	$4,0($2)
	lh	$2,0($3)
	#nop
	mult	$4,$2
	addu	$8,$8,6
	addu	$7,$7,2
	addu	$9,$9,1
	slt	$2,$9,3
	mflo	$18
	#nop
	.set	noreorder
	.set	nomacro
	bne	$2,$0,$L15
	addu	$10,$10,$18
	.set	macro
	.set	reorder

	addu	$2,$6,$12
	sra	$3,$10,12
	sh	$3,0($2)
	addu	$12,$12,2
	addu	$13,$13,1
	slt	$2,$13,3
	.set	noreorder
	.set	nomacro
	bne	$2,$0,$L11
	addu	$11,$11,2
	.set	macro
	.set	reorder

	lw	$3,20($25)
	addu	$25,$25,4
	lw	$2,20($24)
	addu	$24,$24,4
	addu	$14,$14,6
	addu	$5,$5,1
	addu	$2,$2,$3
	sw	$2,20($15)
	slt	$2,$5,3
	.set	noreorder
	.set	nomacro
	bne	$2,$0,$L7
	addu	$15,$15,4
	.set	macro
	.set	reorder

	lw	$18,8($sp)
	lw	$17,4($sp)
	lw	$16,0($sp)
	#nop
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$sp,$sp,16
	.set	macro
	.set	reorder

	.end	compose
	.text
	.ent	project
project:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	move	$3,$5
	lh	$5,4($4)
	#nop
	beq	$5,$0,$L20
	lh	$2,0($4)
	#nop
	mult	$2,$3
	mflo	$3
	#nop
	#nop
	div	$5,$3,$5
	.set	noreorder
	.set	nomacro
	j	$31
	move	$2,$5
	.set	macro
	.set	reorder

$L20:
	move	$5,$0
	move	$2,$5
	j	$31
	.end	project
