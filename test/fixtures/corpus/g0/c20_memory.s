	.file	1 "c20_memory.c"
gcc2_compiled.:
__gnu_compiled_c:
	.text
	.align	2
	.globl	copy_bytes
	.ent	copy_bytes
copy_bytes:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	move	$2,$6
	.set	noreorder
	.set	nomacro
	blez	$2,$L6
	addu	$6,$6,-1
	.set	macro
	.set	reorder

$L4:
	lbu	$2,0($5)
	addu	$5,$5,1
	move	$3,$6
	addu	$6,$6,-1
	sb	$2,0($4)
	.set	noreorder
	.set	nomacro
	bgtz	$3,$L4
	addu	$4,$4,1
	.set	macro
	.set	reorder

$L6:
	j	$31
	.end	copy_bytes
	.align	2
	.globl	zero_words
	.ent	zero_words
zero_words:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.set	noreorder
	.set	nomacro
	blez	$5,$L13
	move	$3,$0
	.set	macro
	.set	reorder

$L11:
	sw	$0,0($4)
	addu	$3,$3,1
	slt	$2,$3,$5
	.set	noreorder
	.set	nomacro
	bne	$2,$0,$L11
	addu	$4,$4,4
	.set	macro
	.set	reorder

$L13:
	j	$31
	.end	zero_words
	.align	2
	.globl	compare_strings
	.ent	compare_strings
compare_strings:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	lbu	$3,0($4)
	#nop
	beq	$3,$0,$L16
$L19:
	lbu	$2,0($5)
	#nop
	bne	$3,$2,$L16
	addu	$4,$4,1
	lbu	$3,0($4)
	#nop
	.set	noreorder
	.set	nomacro
	bne	$3,$0,$L19
	addu	$5,$5,1
	.set	macro
	.set	reorder

$L16:
	lbu	$3,0($4)
	lbu	$2,0($5)
	.set	noreorder
	.set	nomacro
	j	$31
	subu	$2,$3,$2
	.set	macro
	.set	reorder

	.end	compare_strings
	.align	2
	.globl	string_length
	.ent	string_length
string_length:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	lbu	$2,0($4)
	#nop
	.set	noreorder
	.set	nomacro
	beq	$2,$0,$L22
	move	$3,$4
	.set	macro
	.set	reorder

	addu	$3,$3,1
$L25:
	lbu	$2,0($3)
	#nop
	.set	noreorder
	.set	nomacro
	bne	$2,$0,$L25
	addu	$3,$3,1
	.set	macro
	.set	reorder

	addu	$3,$3,-1
$L22:
	.set	noreorder
	.set	nomacro
	j	$31
	subu	$2,$3,$4
	.set	macro
	.set	reorder

	.end	string_length
	.align	2
	.globl	fill_pattern
	.ent	fill_pattern
fill_pattern:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.set	noreorder
	.set	nomacro
	beq	$5,$0,$L31
	addu	$3,$5,-1
	.set	macro
	.set	reorder

	li	$5,-1			# 0xffffffff
$L29:
	xor	$2,$6,$3
	sh	$2,0($4)
	addu	$3,$3,-1
	.set	noreorder
	.set	nomacro
	bne	$3,$5,$L29
	addu	$4,$4,2
	.set	macro
	.set	reorder

$L31:
	j	$31
	.end	fill_pattern
	.align	2
	.globl	clear_block
	.ent	clear_block
clear_block:
	.frame	$sp,88,$31		# vars= 64, regs= 2/0, args= 16, extra= 0
	.mask	0x80010000,-4
	.fmask	0x00000000,0
	subu	$sp,$sp,88
	sw	$16,80($sp)
	move	$16,$4
	addu	$4,$sp,16
	move	$5,$0
	sw	$31,84($sp)
	.set	noreorder
	.set	nomacro
	jal	memset
	li	$6,64			# 0x00000040
	.set	macro
	.set	reorder

	addu	$2,$sp,16
	addu	$3,$sp,80
$L33:
	lw	$7,0($2)
	lw	$8,4($2)
	lw	$9,8($2)
	lw	$10,12($2)
	sw	$7,0($16)
	sw	$8,4($16)
	sw	$9,8($16)
	sw	$10,12($16)
	addu	$2,$2,16
	.set	noreorder
	.set	nomacro
	bne	$2,$3,$L33
	addu	$16,$16,16
	.set	macro
	.set	reorder

	lw	$31,84($sp)
	lw	$16,80($sp)
	#nop
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$sp,$sp,88
	.set	macro
	.set	reorder

	.end	clear_block

	.text
