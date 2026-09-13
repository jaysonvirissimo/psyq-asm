	.file	1 "c01_switch_dense.c"
gcc2_compiled.:
__gnu_compiled_c:
	.text
	.align	2
	.globl	classify_digit
	.align	2
	.globl	opcode_length
	.align	2
	.globl	step_machine

	.text
	.text
	.ent	classify_digit
classify_digit:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	addu	$3,$4,-48
	sltu	$2,$3,10
	.set	noreorder
	.set	nomacro
	beq	$2,$0,$L13
	lui	$2,%hi($L14) # high
	.set	macro
	.set	reorder

	addiu	$2,$2,%lo($L14) # low
	sll	$3,$3,2
	addu	$3,$3,$2
	lw	$2,0($3)
	#nop
	j	$2
	.rdata
	.align	3
$L14:
	.word	$L7
	.word	$L12
	.word	$L7
	.word	$L12
	.word	$L7
	.word	$L12
	.word	$L7
	.word	$L12
	.word	$L7
	.word	$L12
	.text
$L7:
	.set	noreorder
	.set	nomacro
	j	$31
	move	$2,$0
	.set	macro
	.set	reorder

$L12:
	.set	noreorder
	.set	nomacro
	j	$31
	li	$2,1			# 0x00000001
	.set	macro
	.set	reorder

$L13:
	.set	noreorder
	.set	nomacro
	j	$31
	li	$2,-1			# 0xffffffff
	.set	macro
	.set	reorder

	.end	classify_digit
	.text
	.ent	opcode_length
opcode_length:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	andi	$3,$4,0x00ff
	sltu	$2,$3,12
	.set	noreorder
	.set	nomacro
	beq	$2,$0,$L30
	lui	$2,%hi($L31) # high
	.set	macro
	.set	reorder

	addiu	$2,$2,%lo($L31) # low
	sll	$3,$3,2
	addu	$3,$3,$2
	lw	$2,0($3)
	#nop
	j	$2
	.rdata
	.align	3
$L31:
	.word	$L18
	.word	$L19
	.word	$L19
	.word	$L21
	.word	$L18
	.word	$L23
	.word	$L19
	.word	$L21
	.word	$L18
	.word	$L27
	.word	$L19
	.word	$L19
	.text
$L18:
	.set	noreorder
	.set	nomacro
	j	$31
	li	$2,1			# 0x00000001
	.set	macro
	.set	reorder

$L19:
	.set	noreorder
	.set	nomacro
	j	$31
	li	$2,2			# 0x00000002
	.set	macro
	.set	reorder

$L21:
	.set	noreorder
	.set	nomacro
	j	$31
	li	$2,3			# 0x00000003
	.set	macro
	.set	reorder

$L23:
	.set	noreorder
	.set	nomacro
	j	$31
	li	$2,4			# 0x00000004
	.set	macro
	.set	reorder

$L27:
	.set	noreorder
	.set	nomacro
	j	$31
	li	$2,5			# 0x00000005
	.set	macro
	.set	reorder

$L30:
	.set	noreorder
	.set	nomacro
	j	$31
	move	$2,$0
	.set	macro
	.set	reorder

	.end	opcode_length
	.text
	.ent	step_machine
step_machine:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	sltu	$2,$4,6
	.set	noreorder
	.set	nomacro
	beq	$2,$0,$L44
	lui	$2,%hi($L45) # high
	.set	macro
	.set	reorder

	addiu	$2,$2,%lo($L45) # low
	sll	$3,$4,2
	addu	$3,$3,$2
	lw	$2,0($3)
	#nop
	j	$2
	.rdata
	.align	3
$L45:
	.word	$L35
	.word	$L37
	.word	$L40
	.word	$L41
	.word	$L42
	.word	$L43
	.text
$L35:
	slt	$2,$5,11
	.set	noreorder
	.set	nomacro
	bne	$2,$0,$L47
	li	$3,1			# 0x00000001
	.set	macro
	.set	reorder

	.set	noreorder
	.set	nomacro
	j	$31
	li	$2,3			# 0x00000003
	.set	macro
	.set	reorder

$L37:
	li	$3,1			# 0x00000001
$L47:
	and	$2,$5,$3
	beq	$2,$0,$L38
	li	$3,2			# 0x00000002
$L38:
	.set	noreorder
	.set	nomacro
	j	$31
	move	$2,$3
	.set	macro
	.set	reorder

$L40:
	.set	noreorder
	.set	nomacro
	j	$L34
	addu	$4,$4,$5
	.set	macro
	.set	reorder

$L41:
	.set	noreorder
	.set	nomacro
	j	$L34
	subu	$4,$4,$5
	.set	macro
	.set	reorder

$L42:
	sll	$2,$5,1
	.set	noreorder
	.set	nomacro
	j	$L34
	addu	$4,$2,$5
	.set	macro
	.set	reorder

$L43:
	.set	noreorder
	.set	nomacro
	j	$31
	subu	$2,$0,$4
	.set	macro
	.set	reorder

$L44:
	move	$4,$0
$L34:
	.set	noreorder
	.set	nomacro
	j	$31
	move	$2,$4
	.set	macro
	.set	reorder

	.end	step_machine
