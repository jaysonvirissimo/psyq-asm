	.file	1 "c07_bitfields.c"
gcc2_compiled.:
__gnu_compiled_c:
	.text
	.align	2
	.globl	is_visible
	.align	2
	.globl	set_layer
	.align	2
	.globl	get_depth
	.align	2
	.globl	pack
	.align	2
	.globl	combine

	.text
	.text
	.ent	is_visible
is_visible:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	lw	$2,0($4)
	.set	noreorder
	.set	nomacro
	j	$31
	andi	$2,$2,0x0001
	.set	macro
	.set	reorder

	.end	is_visible
	.text
	.ent	set_layer
set_layer:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	li	$3,-15			# 0xfffffff1
	andi	$5,$5,0x0007
	lw	$2,0($4)
	sll	$5,$5,1
	and	$2,$2,$3
	or	$2,$2,$5
	.set	noreorder
	.set	nomacro
	j	$31
	sw	$2,0($4)
	.set	macro
	.set	reorder

	.end	set_layer
	.text
	.ent	get_depth
get_depth:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	lw	$2,0($4)
	#nop
	sll	$2,$2,23
	.set	noreorder
	.set	nomacro
	j	$31
	sra	$2,$2,27
	.set	macro
	.set	reorder

	.end	get_depth
	.text
	.ent	pack
pack:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	li	$3,-65536			# 0xffff0000
	ori	$3,$3,0x01ff
	andi	$5,$5,0x007f
	lw	$2,0($4)
	sll	$5,$5,9
	and	$2,$2,$3
	or	$2,$2,$5
	sw	$2,0($4)
	sh	$6,2($4)
	lw	$2,0($4)
	li	$3,-497			# 0xfffffe0f
	and	$2,$2,$3
	ori	$2,$2,0x01d0
	.set	noreorder
	.set	nomacro
	j	$31
	sw	$2,0($4)
	.set	macro
	.set	reorder

	.end	pack
	.text
	.ent	combine
combine:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	lw	$2,0($4)
	#nop
	sll	$3,$2,7
	andi	$3,$3,0x0700
	srl	$2,$2,9
	andi	$2,$2,0x007f
	.set	noreorder
	.set	nomacro
	j	$31
	or	$2,$3,$2
	.set	macro
	.set	reorder

	.end	combine
