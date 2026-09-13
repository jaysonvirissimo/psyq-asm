	.file	1 "c18_loops.c"
gcc2_compiled.:
__gnu_compiled_c:
	.text
	.align	2
	.globl	count_bits
	.ent	count_bits
count_bits:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.set	noreorder
	.set	nomacro
	beq	$4,$0,$L3
	move	$3,$0
	.set	macro
	.set	reorder

$L4:
	andi	$2,$4,0x0001
	srl	$4,$4,1
	.set	noreorder
	.set	nomacro
	bne	$4,$0,$L4
	addu	$3,$3,$2
	.set	macro
	.set	reorder

$L3:
	.set	noreorder
	.set	nomacro
	j	$31
	move	$2,$3
	.set	macro
	.set	reorder

	.end	count_bits
	.align	2
	.globl	find_first
	.ent	find_first
find_first:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.set	noreorder
	.set	nomacro
	blez	$5,$L8
	move	$3,$0
	.set	macro
	.set	reorder

$L10:
	lw	$2,0($4)
	#nop
	bltz	$2,$L9
	beq	$2,$6,$L8
$L9:
	addu	$3,$3,1
	slt	$2,$3,$5
	.set	noreorder
	.set	nomacro
	bne	$2,$0,$L10
	addu	$4,$4,4
	.set	macro
	.set	reorder

$L8:
	.set	noreorder
	.set	nomacro
	j	$31
	move	$2,$3
	.set	macro
	.set	reorder

	.end	find_first
	.align	2
	.globl	reverse
	.ent	reverse
reverse:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	move	$8,$4
	addu	$7,$5,-1
	.set	noreorder
	.set	nomacro
	blez	$7,$L19
	move	$6,$0
	.set	macro
	.set	reorder

$L17:
	addu	$4,$8,$6
	addu	$6,$6,1
	addu	$3,$8,$7
	lbu	$5,0($4)
	lbu	$2,0($3)
	addu	$7,$7,-1
	sb	$2,0($4)
	slt	$2,$6,$7
	.set	noreorder
	.set	nomacro
	bne	$2,$0,$L17
	sb	$5,0($3)
	.set	macro
	.set	reorder

$L19:
	j	$31
	.end	reverse
	.align	2
	.globl	nested_break
	.ent	nested_break
nested_break:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	li	$7,-1			# 0xffffffff
	.set	noreorder
	.set	nomacro
	blez	$4,$L22
	move	$6,$0
	.set	macro
	.set	reorder

$L32:
	bgez	$7,$L22
	.set	noreorder
	.set	nomacro
	blez	$4,$L23
	move	$5,$0
	.set	macro
	.set	reorder

	move	$3,$5
$L29:
	bne	$3,$4,$L28
	.set	noreorder
	.set	nomacro
	j	$L23
	move	$7,$6
	.set	macro
	.set	reorder

$L28:
	addu	$5,$5,1
	slt	$2,$5,$4
	.set	noreorder
	.set	nomacro
	bne	$2,$0,$L29
	addu	$3,$3,$6
	.set	macro
	.set	reorder

$L23:
	addu	$6,$6,1
	slt	$2,$6,$4
	bne	$2,$0,$L32
$L22:
	.set	noreorder
	.set	nomacro
	j	$31
	move	$2,$7
	.set	macro
	.set	reorder

	.end	nested_break
	.align	2
	.globl	checksum
	.ent	checksum
checksum:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	li	$6,1			# 0x00000001
	move	$7,$0
	li	$8,-2146992015			# 0x80078071
$L34:
	lbu	$3,0($4)
	#nop
	addu	$3,$6,$3
	multu	$3,$8
	mfhi	$9
	#nop
	#nop
	srl	$6,$9,15
	sll	$2,$6,12
	subu	$2,$2,$6
	sll	$2,$2,4
	addu	$2,$2,$6
	subu	$6,$3,$2
	addu	$3,$7,$6
	multu	$3,$8
	addu	$4,$4,1
	addu	$5,$5,-1
	mfhi	$9
	#nop
	#nop
	srl	$7,$9,15
	sll	$2,$7,12
	subu	$2,$2,$7
	sll	$2,$2,4
	addu	$2,$2,$7
	.set	noreorder
	.set	nomacro
	bgtz	$5,$L34
	subu	$7,$3,$2
	.set	macro
	.set	reorder

	sll	$2,$7,16
	.set	noreorder
	.set	nomacro
	j	$31
	or	$2,$2,$6
	.set	macro
	.set	reorder

	.end	checksum

	.text
