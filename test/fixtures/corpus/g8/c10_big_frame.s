	.file	1 "c10_big_frame.c"
gcc2_compiled.:
__gnu_compiled_c:
	.text
	.align	2
	.globl	big_buffer
	.align	2
	.globl	huge_locals
	.align	2
	.globl	medium_frame

	.text
	.text
	.ent	big_buffer
big_buffer:
	.frame	$sp,40024,$31		# vars= 40000, regs= 2/0, args= 16, extra= 0
	.mask	0x80010000,-4
	.fmask	0x00000000,0
	li	$12,40024			# 0x00009c58
	subu	$sp,$sp,$12
	addu	$13,$12,$sp
	sw	$16,-8($13)
	move	$16,$4
	addu	$4,$sp,16
	sw	$31,-4($13)
	.set	noreorder
	.set	nomacro
	jal	fill
	li	$5,40000			# 0x00009c40
	.set	macro
	.set	reorder

	andi	$16,$16,0x7fff
	addu	$2,$sp,16
	addu	$16,$2,$16
	li	$3,32768			# 0x00008000
	addu	$2,$2,$3
	li	$12,40024			# 0x00009c58
	addu	$13,$12,$sp
	lbu	$3,0($16)
	lbu	$2,7231($2)
	lw	$31,-4($13)
	lw	$16,-8($13)
	addu	$2,$3,$2
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$sp,$sp,$12
	.set	macro
	.set	reorder

	.end	big_buffer
	.text
	.ent	huge_locals
huge_locals:
	.frame	$sp,80000,$31		# vars= 80000, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	li	$12,65536			# 0x00010000
	ori	$12,$12,0x3880
	subu	$sp,$sp,$12
	li	$5,19999			# 0x00004e1f
	li	$2,65536			# 0x00010000
	ori	$2,$2,0x387c
	addu	$3,$sp,$2
	sll	$2,$4,2
	addu	$2,$2,$4
	sll	$2,$2,3
	subu	$2,$2,$4
	sll	$2,$2,4
	addu	$2,$2,$4
	sll	$2,$2,5
	subu	$2,$2,$4
$L6:
	sw	$2,0($3)
	addu	$3,$3,-4
	addu	$5,$5,-1
	.set	noreorder
	.set	nomacro
	bgez	$5,$L6
	subu	$2,$2,$4
	.set	macro
	.set	reorder

	andi	$2,$4,0x3fff
	sll	$2,$2,2
	addu	$2,$sp,$2
	lw	$2,0($2)
	li	$12,65536			# 0x00010000
	ori	$12,$12,0x3880
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$sp,$sp,$12
	.set	macro
	.set	reorder

	.end	huge_locals
	.text
	.ent	medium_frame
medium_frame:
	.frame	$sp,2072,$31		# vars= 2048, regs= 1/0, args= 16, extra= 0
	.mask	0x80000000,-8
	.fmask	0x00000000,0
	subu	$sp,$sp,2072
	andi	$2,$4,0x03ff
	sll	$2,$2,1
	addu	$3,$sp,16
	addu	$2,$3,$2
	sw	$31,2064($sp)
	sh	$4,0($2)
	move	$4,$3
	.set	noreorder
	.set	nomacro
	jal	fill
	li	$5,2048			# 0x00000800
	.set	macro
	.set	reorder

	lw	$31,2064($sp)
	#nop
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$sp,$sp,2072
	.set	macro
	.set	reorder

	.end	medium_frame
