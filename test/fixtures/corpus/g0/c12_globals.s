	.file	1 "c12_globals.c"
gcc2_compiled.:
__gnu_compiled_c:
	.globl	small_short
	.data
	.align	1
small_short:
	.half	7
	.globl	origin
	.align	2
origin:
	.word	1
	.word	2
	.word	3
	.globl	pi_value
	.align	3
pi_value:
	.word	0x00000000		# 3.25
	.word	0x400a0000
	.text
	.align	2
	.globl	bump
	.ent	bump
bump:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	lui	$3,%hi(counter) # high
	lui	$4,%hi(small_short) # high
	lw	$2,%lo(counter)($3)
	lh	$4,%lo(small_short)($4)
	addu	$2,$2,1
	sw	$2,%lo(counter)($3)
	lbu	$5,%lo(counter)($3)
	lui	$3,%hi(small_char) # high
	addu	$2,$2,$4
	.set	noreorder
	.set	nomacro
	j	$31
	sb	$5,%lo(small_char)($3)
	.set	macro
	.set	reorder

	.end	bump
	.align	2
	.globl	total
	.ent	total
total:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	lui	$6,%hi(shared_total) # high
	lui	$5,%hi(shared_table+3) # high
	lui	$4,%hi(big_array) # high
	lui	$2,%hi(counter) # high
	addiu	$4,$4,%lo(big_array) # low
	lw	$3,%lo(counter)($2)
	lw	$2,%lo(shared_total)($6)
	andi	$3,$3,0x003f
	sll	$3,$3,2
	addu	$3,$3,$4
	lbu	$4,%lo(shared_table+3)($5)
	lw	$3,0($3)
	addu	$2,$2,$4
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$2,$2,$3
	.set	macro
	.set	reorder

	.end	total
	.align	2
	.globl	address_of
	.ent	address_of
address_of:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	beq	$4,$0,$L4
	lui	$2,%hi(counter) # high
	.set	noreorder
	.set	nomacro
	j	$31
	addiu	$2,$2,%lo(counter) # low
	.set	macro
	.set	reorder

$L4:
	lui	$2,%hi(big_array+40) # high
	.set	noreorder
	.set	nomacro
	j	$31
	addiu	$2,$2,%lo(big_array+40) # low
	.set	macro
	.set	reorder

	.end	address_of
	.align	2
	.globl	dot_origin
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
	.align	2
	.globl	pi_twice
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
	.align	2
	.globl	store_all
	.ent	store_all
store_all:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	lui	$2,%hi(counter) # high
	sw	$4,%lo(counter)($2)
	lui	$2,%hi(shared_total) # high
	sw	$4,%lo(shared_total)($2)
	lui	$2,%hi(big_array+20) # high
	sw	$4,%lo(big_array+20)($2)
	lui	$2,%hi(origin+4) # high
	.set	noreorder
	.set	nomacro
	j	$31
	sw	$4,%lo(origin+4)($2)
	.set	macro
	.set	reorder

	.end	store_all

	.comm	counter,4

	.comm	small_char,1

	.comm	big_array,256

	.text
