	.file	1 "c25_data_tables.c"
gcc2_compiled.:
__gnu_compiled_c:
	.globl	greeting
	.rdata
	.align	2
greeting:
	.ascii	"hello, corpus\000"
	.globl	messages
	.data
	.align	2
messages:
	.word	$LC0
	.word	$LC1
	.word	0
	.rdata
	.align	2
$LC1:
	.ascii	"second\000"
	.align	2
$LC0:
	.ascii	"first\000"
	.globl	palette
	.data
	.align	2
palette:
	.byte	0
	.byte	17
	.byte	34
	.byte	51
	.byte	68
	.byte	85
	.byte	102
	.byte	119
	.byte	136
	.byte	153
	.byte	170
	.byte	187
	.byte	204
	.byte	221
	.byte	238
	.byte	255
	.globl	lookup
	.align	2
lookup:
	.half	-1
	.half	32767
	.half	-32768
	.half	12
	.globl	pointer_table
	.align	2
pointer_table:
	.word	0
	.word	0
	.globl	points_outside
	.align	2
points_outside:
	.word	external_value
	.globl	offsets
	.align	2
offsets:
	.word	14
	.word	4
	.word	8
	.text
	.align	2
	.globl	message
	.ent	message
message:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	lui	$2,%hi(messages) # high
	addiu	$5,$2,%lo(messages) # low
	sltu	$2,$4,3
	.set	noreorder
	.set	nomacro
	beq	$2,$0,$L2
	li	$3,8			# 0x00000008
	.set	macro
	.set	reorder

	sll	$3,$4,2
$L2:
	addu	$2,$3,$5
	lw	$2,0($2)
	j	$31
	.end	message
	.align	2
	.globl	palette_sum
	.ent	palette_sum
palette_sum:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	move	$4,$0
	move	$3,$4
	lui	$2,%hi(palette) # high
	addiu	$5,$2,%lo(palette) # low
$L8:
	addu	$2,$3,$5
	lbu	$2,0($2)
	addu	$3,$3,1
	addu	$4,$4,$2
	slt	$2,$3,16
	.set	noreorder
	.set	nomacro
	bne	$2,$0,$L8
	lui	$2,%hi(lookup+2) # high
	.set	macro
	.set	reorder

	lh	$2,%lo(lookup+2)($2)
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$2,$4,$2
	.set	macro
	.set	reorder

	.end	palette_sum
	.align	2
	.globl	greeting_char
	.ent	greeting_char
greeting_char:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	lui	$2,%hi(greeting) # high
	addiu	$2,$2,%lo(greeting) # low
	andi	$4,$4,0x0007
	addu	$4,$4,$2
	lbu	$2,0($4)
	j	$31
	.end	greeting_char

	.text
