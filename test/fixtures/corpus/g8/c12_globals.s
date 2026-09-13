	.file	1 "c12_globals.c"
gcc2_compiled.:
__gnu_compiled_c:
	.globl	small_short
	.sdata
	.align	1
small_short:
	.half	7
	.globl	origin
	.data
	.align	2
origin:
	.word	1
	.word	2
	.word	3
	.globl	pi_value
	.sdata
	.align	3
pi_value:
	.word	0x00000000		# 3.25
	.word	0x400a0000
	.text
	.align	2
	.globl	bump
	.align	2
	.globl	total
	.align	2
	.globl	address_of
	.align	2
	.globl	dot_origin
	.align	2
	.globl	pi_twice
	.align	2
	.globl	store_all

	.comm	counter,4

	.comm	small_char,1

	.comm	big_array,256

	.extern	shared_table, 256
	.extern	shared_total, 4

	.text
	.text
	.ent	bump
bump:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	lw	$2,counter
	lh	$4,small_short
	addu	$2,$2,1
	sw	$2,counter
	lbu	$3,counter
	#nop
	sb	$3,small_char
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$2,$2,$4
	.set	macro
	.set	reorder

	.end	bump
	.text
	.ent	total
total:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	lui	$4,%hi(shared_table+3) # high
	lui	$2,%hi(big_array) # high
	addiu	$2,$2,%lo(big_array) # low
	lw	$3,counter
	lbu	$4,%lo(shared_table+3)($4)
	andi	$3,$3,0x003f
	sll	$3,$3,2
	addu	$3,$3,$2
	lw	$2,shared_total
	lw	$3,0($3)
	addu	$2,$2,$4
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$2,$2,$3
	.set	macro
	.set	reorder

	.end	total
	.text
	.ent	address_of
address_of:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.set	noreorder
	.set	nomacro
	beq	$4,$0,$L4
	lui	$2,%hi(big_array+40) # high
	.set	macro
	.set	reorder

	la	$2,counter
	j	$31
$L4:
	.set	noreorder
	.set	nomacro
	j	$31
	addiu	$2,$2,%lo(big_array+40) # low
	.set	macro
	.set	reorder

	.end	address_of
	.text
	.ent	dot_origin
dot_origin:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	lui	$3,%hi(origin) # high
	lw	$5,0($4)
	lw	$2,%lo(origin)($3)
	#nop
	mult	$5,$2
	addiu	$3,$3,%lo(origin) # low
	lw	$5,4($4)
	mflo	$6
	#nop
	lw	$2,4($3)
	#nop
	mult	$5,$2
	lw	$4,8($4)
	mflo	$5
	#nop
	lw	$2,8($3)
	#nop
	mult	$4,$2
	addu	$2,$6,$5
	mflo	$3
	#nop
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$2,$2,$3
	.set	macro
	.set	reorder

	.end	dot_origin
	.text
	.ent	pi_twice
pi_twice:
	.frame	$sp,24,$31		# vars= 0, regs= 1/0, args= 16, extra= 0
	.mask	0x80000000,-8
	.fmask	0x00000000,0
	lw	$4,pi_value
	lw	$5,pi_value+4
	subu	$sp,$sp,24
	sw	$31,16($sp)
	move	$6,$4
	.set	noreorder
	.set	nomacro
	jal	__adddf3
	move	$7,$5
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

	.end	pi_twice
	.text
	.ent	store_all
store_all:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	lui	$2,%hi(big_array+20) # high
	sw	$4,%lo(big_array+20)($2)
	lui	$2,%hi(origin+4) # high
	sw	$4,counter
	sw	$4,shared_total
	.set	noreorder
	.set	nomacro
	j	$31
	sw	$4,%lo(origin+4)($2)
	.set	macro
	.set	reorder

	.end	store_all
