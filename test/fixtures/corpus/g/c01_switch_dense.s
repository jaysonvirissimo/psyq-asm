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
	.def	classify_digit;	.val	classify_digit;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 6
LM1:

	.loc	1 6
LM2:
	.ent	classify_digit
classify_digit:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	c;	.val	4;	.scl	17;	.type	0x4;	.endef

	.loc	1 7
LM3:
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

	.loc	1 9
LM4:
	.set	noreorder
	.set	nomacro
	j	$31
	move	$2,$0
	.set	macro
	.set	reorder

$L12:

	.loc	1 11
LM5:
	.set	noreorder
	.set	nomacro
	j	$31
	li	$2,1			# 0x00000001
	.set	macro
	.set	reorder

$L13:

	.loc	1 13
LM6:
	.set	noreorder
	.set	nomacro
	j	$31
	li	$2,-1			# 0xffffffff
	.set	macro
	.set	reorder


	.loc	1 13
LM7:
	.end	classify_digit
	.def	opcode_length;	.val	opcode_length;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 18
LM8:

	.loc	1 18
LM9:
	.ent	opcode_length
opcode_length:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	op;	.val	4;	.scl	17;	.type	0xc;	.endef

	.loc	1 19
LM10:
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

	.loc	1 20
LM11:
$L18:
	.set	noreorder
	.set	nomacro
	j	$31
	li	$2,1			# 0x00000001
	.set	macro
	.set	reorder

$L19:

	.loc	1 21
LM12:
	.set	noreorder
	.set	nomacro
	j	$31
	li	$2,2			# 0x00000002
	.set	macro
	.set	reorder

$L21:

	.loc	1 23
LM13:
	.set	noreorder
	.set	nomacro
	j	$31
	li	$2,3			# 0x00000003
	.set	macro
	.set	reorder

$L23:

	.loc	1 25
LM14:
	.set	noreorder
	.set	nomacro
	j	$31
	li	$2,4			# 0x00000004
	.set	macro
	.set	reorder

$L27:

	.loc	1 29
LM15:
	.set	noreorder
	.set	nomacro
	j	$31
	li	$2,5			# 0x00000005
	.set	macro
	.set	reorder

$L30:

	.loc	1 32
LM16:
	.set	noreorder
	.set	nomacro
	j	$31
	move	$2,$0
	.set	macro
	.set	reorder


	.loc	1 32
LM17:
	.end	opcode_length
	.def	step_machine;	.val	step_machine;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 37
LM18:

	.loc	1 37
LM19:
	.ent	step_machine
step_machine:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	state;	.val	4;	.scl	17;	.type	0x4;	.endef
	.def	input;	.val	5;	.scl	17;	.type	0x4;	.endef

	.loc	1 38
LM20:
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

	.loc	1 40
LM21:
	slt	$2,$5,11
	.set	noreorder
	.set	nomacro
	bne	$2,$0,$L47
	li	$3,1			# 0x00000001
	.set	macro
	.set	reorder


	.loc	1 41
LM22:
	.set	noreorder
	.set	nomacro
	j	$31
	li	$2,3			# 0x00000003
	.set	macro
	.set	reorder

$L37:

	.loc	1 44
LM23:
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

	.loc	1 47
LM24:
	.set	noreorder
	.set	nomacro
	j	$L34
	addu	$4,$4,$5
	.set	macro
	.set	reorder

$L41:

	.loc	1 50
LM25:
	.set	noreorder
	.set	nomacro
	j	$L34
	subu	$4,$4,$5
	.set	macro
	.set	reorder

$L42:

	.loc	1 52
LM26:
	sll	$2,$5,1

	.loc	1 53
LM27:
	.set	noreorder
	.set	nomacro
	j	$L34
	addu	$4,$2,$5
	.set	macro
	.set	reorder

$L43:

	.loc	1 55
LM28:
	.set	noreorder
	.set	nomacro
	j	$31
	subu	$2,$0,$4
	.set	macro
	.set	reorder

$L44:

	.loc	1 57
LM29:
	move	$4,$0
$L34:

	.loc	1 59
LM30:
	.set	noreorder
	.set	nomacro
	j	$31
	move	$2,$4
	.set	macro
	.set	reorder


	.loc	1 59
LM31:
	.end	step_machine
