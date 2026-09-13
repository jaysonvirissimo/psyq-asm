	.file	1 "c13_static_locals.c"
gcc2_compiled.:
__gnu_compiled_c:
	.rdata
	.align	2
names:
	.word	$LC0
	.word	$LC1
	.word	$LC2
	.word	$LC3
	.sdata
	.align	2
$LC3:
	.ascii	"three\000"
	.align	2
$LC2:
	.ascii	"two\000"
	.align	2
$LC1:
	.ascii	"one\000"
	.align	2
$LC0:
	.ascii	"zero\000"
	.data
	.align	2
table:
	.half	1
	.half	1
	.half	2
	.half	3
	.half	5
	.half	8
	.half	13
	.half	21
	.text
	.align	2
	.align	2
	.globl	name_of
	.sdata
	.align	2
id.6:
	.word	100

	.lcomm	step.7,2
	.text
	.align	2
	.globl	next_id
	.align	2
	.globl	scratch
	.align	2
	.globl	fib_table
	.rdata
	.align	2
$LC4:
	.ascii	"a literal string\000"
	.text
	.align	2
	.globl	literal_length

	.lcomm	calls,4

	.lcomm	buffer,128

	.text
	.text
	.ent	helper_twice
helper_twice:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.set	noreorder
	.set	nomacro
	j	$31
	sll	$2,$4,1
	.set	macro
	.set	reorder

	.end	helper_twice
	.text
	.ent	name_of
name_of:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	lw	$2,calls
	#nop
	addu	$2,$2,1
	sw	$2,calls
	lui	$2,%hi(names) # high
	addiu	$5,$2,%lo(names) # low
	sltu	$2,$4,4
	.set	noreorder
	.set	nomacro
	beq	$2,$0,$L3
	move	$3,$0
	.set	macro
	.set	reorder

	sll	$3,$4,2
$L3:
	addu	$2,$3,$5
	lw	$2,0($2)
	j	$31
	.end	name_of
	.text
	.ent	next_id
next_id:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	lhu	$3,step.7
	lw	$2,id.6
	addu	$3,$3,2
	sh	$3,step.7
	sll	$3,$3,16
	sra	$3,$3,16
	addu	$2,$2,$3
	sw	$2,id.6
	j	$31
	.end	next_id
	.text
	.ent	scratch
scratch:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	lui	$2,%hi(buffer) # high
	addiu	$2,$2,%lo(buffer) # low
	andi	$4,$4,0x007f
	addu	$4,$4,$2
	li	$3,120			# 0x00000078
	.set	noreorder
	.set	nomacro
	j	$31
	sb	$3,0($4)
	.set	macro
	.set	reorder

	.end	scratch
	.text
	.ent	fib_table
fib_table:
	.frame	$sp,24,$31		# vars= 0, regs= 2/0, args= 16, extra= 0
	.mask	0x80010000,-4
	.fmask	0x00000000,0
	subu	$sp,$sp,24
	sw	$16,16($sp)
	move	$16,$4
	lw	$4,calls
	sw	$31,20($sp)
	.set	noreorder
	.set	nomacro
	jal	helper_twice
	andi	$16,$16,0x0007
	.set	macro
	.set	reorder

	lui	$3,%hi(table) # high
	addiu	$3,$3,%lo(table) # low
	sll	$16,$16,1
	addu	$16,$16,$3
	lh	$3,0($16)
	lw	$31,20($sp)
	lw	$16,16($sp)
	addu	$2,$3,$2
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$sp,$sp,24
	.set	macro
	.set	reorder

	.end	fib_table
	.text
	.ent	literal_length
literal_length:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	lui	$2,%hi($LC4) # high
	addiu	$3,$2,%lo($LC4) # low
	move	$4,$0
	lbu	$2,%lo($LC4)($2)
	#nop
	.set	noreorder
	.set	nomacro
	beq	$2,$0,$L10
	addu	$3,$3,1
	.set	macro
	.set	reorder

$L11:
	addu	$4,$4,1
	lbu	$2,0($3)
	#nop
	.set	noreorder
	.set	nomacro
	bne	$2,$0,$L11
	addu	$3,$3,1
	.set	macro
	.set	reorder

$L10:
	.set	noreorder
	.set	nomacro
	j	$31
	move	$2,$4
	.set	macro
	.set	reorder

	.end	literal_length
