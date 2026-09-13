	.file	1 "c17_pointers.c"
gcc2_compiled.:
__gnu_compiled_c:
	.text
	.align	2
	.ent	twice
twice:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.set	noreorder
	.set	nomacro
	j	$31
	sll	$2,$4,1
	.set	macro
	.set	reorder

	.end	twice
	.align	2
	.ent	square
square:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	mult	$4,$4
	mflo	$2
	#nop
	j	$31
	.end	square
	.globl	entries
	.data
	.align	2
entries:
	.word	$LC0
	.word	twice
	.word	1
	.word	$LC1
	.word	square
	.word	2
	.rdata
	.align	2
$LC1:
	.ascii	"square\000"
	.align	2
$LC0:
	.ascii	"twice\000"
	.text
	.align	2
	.globl	apply
	.ent	apply
apply:
	.frame	$sp,24,$31		# vars= 0, regs= 1/0, args= 16, extra= 0
	.mask	0x80000000,-8
	.fmask	0x00000000,0
	subu	$sp,$sp,24
	move	$2,$4
	sw	$31,16($sp)
	.set	noreorder
	.set	nomacro
	jal	$31,$2
	move	$4,$5
	.set	macro
	.set	reorder

	lw	$31,16($sp)
	#nop
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$sp,$sp,24
	.set	macro
	.set	reorder

	.end	apply
	.align	2
	.globl	run_all
	.ent	run_all
run_all:
	.frame	$sp,40,$31		# vars= 0, regs= 5/0, args= 16, extra= 0
	.mask	0x800f0000,-8
	.fmask	0x00000000,0
	subu	$sp,$sp,40
	sw	$19,28($sp)
	move	$19,$4
	sw	$18,24($sp)
	move	$18,$0
	sw	$17,20($sp)
	move	$17,$18
	lui	$2,%hi(entries) # high
	sw	$16,16($sp)
	addiu	$16,$2,%lo(entries) # low
	sw	$31,32($sp)
$L8:
	lw	$2,4($16)
	#nop
	.set	noreorder
	.set	nomacro
	jal	$31,$2
	move	$4,$19
	.set	macro
	.set	reorder

	lw	$3,8($16)
	#nop
	mult	$2,$3
	addu	$17,$17,1
	addu	$16,$16,12
	slt	$2,$17,2
	mflo	$5
	#nop
	.set	noreorder
	.set	nomacro
	bne	$2,$0,$L8
	addu	$18,$18,$5
	.set	macro
	.set	reorder

	move	$2,$18
	lw	$31,32($sp)
	lw	$19,28($sp)
	lw	$18,24($sp)
	lw	$17,20($sp)
	lw	$16,16($sp)
	#nop
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$sp,$sp,40
	.set	macro
	.set	reorder

	.end	run_all
	.align	2
	.globl	advance
	.ent	advance
advance:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	sll	$2,$5,2
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$2,$4,$2
	.set	macro
	.set	reorder

	.end	advance
	.align	2
	.globl	distance
	.ent	distance
distance:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.set	noreorder
	.set	nomacro
	j	$31
	subu	$2,$5,$4
	.set	macro
	.set	reorder

	.end	distance
	.align	2
	.globl	walk
	.ent	walk
walk:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	move	$9,$0
	.set	noreorder
	.set	nomacro
	blez	$5,$L14
	move	$8,$9
	.set	macro
	.set	reorder

$L16:
	.set	noreorder
	.set	nomacro
	blez	$6,$L15
	move	$7,$0
	.set	macro
	.set	reorder

	lw	$3,0($4)
$L20:
	lw	$2,0($3)
	addu	$7,$7,1
	addu	$8,$8,$2
	slt	$2,$7,$6
	.set	noreorder
	.set	nomacro
	bne	$2,$0,$L20
	addu	$3,$3,4
	.set	macro
	.set	reorder

$L15:
	addu	$9,$9,1
	slt	$2,$9,$5
	.set	noreorder
	.set	nomacro
	bne	$2,$0,$L16
	addu	$4,$4,4
	.set	macro
	.set	reorder

$L14:
	.set	noreorder
	.set	nomacro
	j	$31
	move	$2,$8
	.set	macro
	.set	reorder

	.end	walk
	.align	2
	.globl	select_callback
	.ent	select_callback
select_callback:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	beq	$4,$0,$L24
	lui	$2,%hi(callback_a) # high
	.set	noreorder
	.set	nomacro
	j	$31
	addiu	$2,$2,%lo(callback_a) # low
	.set	macro
	.set	reorder

$L24:
	lui	$2,%hi(callback_b) # high
	.set	noreorder
	.set	nomacro
	j	$31
	addiu	$2,$2,%lo(callback_b) # low
	.set	macro
	.set	reorder

	.end	select_callback

	.text
