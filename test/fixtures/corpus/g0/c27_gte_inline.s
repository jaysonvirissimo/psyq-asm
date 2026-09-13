	.file	1 "c27_gte_inline.c"
gcc2_compiled.:
__gnu_compiled_c:
	.text
	.align	2
	.globl	transform
	.ent	transform
transform:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
 #APP
	lwc2 $0, 0( $4 );lwc2 $1, 4( $4 );lwc2 $2, 8( $4 )
	cop2 0x00486012;
	mfc2 $2, $9
 #NO_APP
	j	$31
	.end	transform
	.align	2
	.globl	transform_padded
	.ent	transform_padded
transform_padded:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
 #APP
	lwc2 $0, 0( $4 );lwc2 $1, 4( $4 );lwc2 $2, 8( $4 )
	nop;nop;cop2 0x01400006;
	mfc2 $2, $9
 #NO_APP
	j	$31
	.end	transform_padded
	.align	2
	.globl	with_depth
	.ent	with_depth
with_depth:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
 #APP
	mtc2 $5, $30
	lwc2 $0, 0( $4 );lwc2 $1, 4( $4 );lwc2 $2, 8( $4 )
	cop2 0x00486012;
	mfc2 $2, $9
 #NO_APP
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$2,$2,$5
	.set	macro
	.set	reorder

	.end	with_depth
	.align	2
	.globl	control_then_store
	.ent	control_then_store
control_then_store:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
 #APP
	ctc2 $5, $31
 #NO_APP
	sw	$5,12($4)
 #APP
	cop2 0x00486012;
	mfc2 $2, $9
 #NO_APP
	j	$31
	.end	control_then_store
	.align	2
	.globl	two_vectors
	.ent	two_vectors
two_vectors:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
 #APP
	lwc2 $0, 0( $4 );lwc2 $1, 4( $4 );lwc2 $2, 8( $4 )
	cop2 0x00486012;
	mfc2 $3, $9
	lwc2 $0, 0( $5 );lwc2 $1, 4( $5 );lwc2 $2, 8( $5 )
	nop;nop;cop2 0x01400006;
	mfc2 $2, $9
 #NO_APP
	.set	noreorder
	.set	nomacro
	j	$31
	subu	$2,$3,$2
	.set	macro
	.set	reorder

	.end	two_vectors

	.text
