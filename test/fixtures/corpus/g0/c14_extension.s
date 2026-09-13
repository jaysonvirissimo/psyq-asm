	.file	1 "c14_extension.c"
gcc2_compiled.:
__gnu_compiled_c:
	.text
	.align	2
	.globl	sign_char
	.ent	sign_char
sign_char:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	sll	$2,$4,24
	.set	noreorder
	.set	nomacro
	j	$31
	sra	$2,$2,24
	.set	macro
	.set	reorder

	.end	sign_char
	.align	2
	.globl	zero_char
	.ent	zero_char
zero_char:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.set	noreorder
	.set	nomacro
	j	$31
	andi	$2,$4,0x00ff
	.set	macro
	.set	reorder

	.end	zero_char
	.align	2
	.globl	sign_short
	.ent	sign_short
sign_short:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	sll	$2,$4,16
	.set	noreorder
	.set	nomacro
	j	$31
	sra	$2,$2,15
	.set	macro
	.set	reorder

	.end	sign_short
	.align	2
	.globl	zero_short
	.ent	zero_short
zero_short:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	andi	$2,$4,0xffff
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$2,$2,1
	.set	macro
	.set	reorder

	.end	zero_short
	.align	2
	.globl	narrow
	.ent	narrow
narrow:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	andi	$2,$4,0x00ff
	sll	$4,$4,16
	sra	$4,$4,16
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$2,$2,$4
	.set	macro
	.set	reorder

	.end	narrow
	.align	2
	.globl	compare_unsigned
	.ent	compare_unsigned
compare_unsigned:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	sltu	$2,$4,$5
	bne	$2,$0,$L8
	addu	$2,$2,2
$L8:
	j	$31
	.end	compare_unsigned
	.align	2
	.globl	compare_mixed
	.ent	compare_mixed
compare_mixed:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.set	noreorder
	.set	nomacro
	j	$31
	slt	$2,$4,$5
	.set	macro
	.set	reorder

	.end	compare_mixed
	.align	2
	.globl	add_bytes
	.ent	add_bytes
add_bytes:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	addu	$2,$4,$5
	.set	noreorder
	.set	nomacro
	j	$31
	andi	$2,$2,0x00ff
	.set	macro
	.set	reorder

	.end	add_bytes
	.align	2
	.globl	load_fields
	.ent	load_fields
load_fields:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	lbu	$3,1($4)
	lbu	$5,0($4)
	lb	$2,2($4)
	sll	$3,$3,8
	or	$5,$5,$3
	sll	$2,$2,16
	.set	noreorder
	.set	nomacro
	j	$31
	or	$2,$5,$2
	.set	macro
	.set	reorder

	.end	load_fields

	.text
