	.file	1 "c27_gte_inline.c"
gcc2_compiled.:
__gnu_compiled_c:
	.text
	.align	2
	.globl	transform
	.align	2
	.globl	transform_padded
	.align	2
	.globl	with_depth
	.align	2
	.globl	control_then_store
	.align	2
	.globl	two_vectors

	.text
	.def	transform;	.val	transform;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 14
LM1:

	.loc	1 14
LM2:
	.ent	transform
transform:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	v;	.val	4;	.scl	17;	.type	0x15;	.endef

	.loc	1 15
LM3:
$Lb0:
	.begin	$Lb0	2

	.loc	1 16
LM4:
$Le1:
	.bend	$Le1	3
 #APP
	lwc2 $0, 0( $4 );lwc2 $1, 4( $4 );lwc2 $2, 8( $4 )
 #NO_APP

	.loc	1 17
LM5:
 #APP
	cop2 0x00486012;
 #NO_APP

	.loc	1 19
LM6:
 #APP
	mfc2 $2, $9
 #NO_APP

	.loc	1 20
LM7:
	j	$31

	.loc	1 20
LM8:
	.end	transform
	.def	transform_padded;	.val	transform_padded;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 23
LM9:

	.loc	1 23
LM10:
	.ent	transform_padded
transform_padded:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	v;	.val	4;	.scl	17;	.type	0x15;	.endef

	.loc	1 24
LM11:
$Lb2:
	.begin	$Lb2	2

	.loc	1 25
LM12:
$Le3:
	.bend	$Le3	3
 #APP
	lwc2 $0, 0( $4 );lwc2 $1, 4( $4 );lwc2 $2, 8( $4 )
 #NO_APP

	.loc	1 26
LM13:
 #APP
	nop;nop;cop2 0x01400006;
 #NO_APP

	.loc	1 28
LM14:
 #APP
	mfc2 $2, $9
 #NO_APP

	.loc	1 29
LM15:
	j	$31

	.loc	1 29
LM16:
	.end	transform_padded
	.def	with_depth;	.val	with_depth;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 32
LM17:

	.loc	1 32
LM18:
	.ent	with_depth
with_depth:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	v;	.val	4;	.scl	17;	.type	0x15;	.endef
	.def	depth;	.val	5;	.scl	17;	.type	0x4;	.endef

	.loc	1 33
LM19:
$Lb4:
	.begin	$Lb4	2
	.def	result;	.val	2;	.scl	4;	.type	0x4;	.endef

	.loc	1 34
LM20:
$Le5:
	.bend	$Le5	3
 #APP
	mtc2 $5, $30
 #NO_APP

	.loc	1 35
LM21:
 #APP
	lwc2 $0, 0( $4 );lwc2 $1, 4( $4 );lwc2 $2, 8( $4 )
 #NO_APP

	.loc	1 36
LM22:
 #APP
	cop2 0x00486012;
 #NO_APP

	.loc	1 37
LM23:
 #APP
	mfc2 $2, $9
 #NO_APP

	.loc	1 39
LM24:
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$2,$2,$5
	.set	macro
	.set	reorder


	.loc	1 39
LM25:
	.end	with_depth
	.def	control_then_store;	.val	control_then_store;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 42
LM26:

	.loc	1 42
LM27:
	.ent	control_then_store
control_then_store:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	v;	.val	4;	.scl	17;	.type	0x15;	.endef
	.def	c;	.val	5;	.scl	17;	.type	0x4;	.endef

	.loc	1 43
LM28:
$Lb6:
	.begin	$Lb6	2

	.loc	1 44
LM29:
$Le7:
	.bend	$Le7	3
 #APP
	ctc2 $5, $31
 #NO_APP

	.loc	1 45
LM30:
	sw	$5,12($4)

	.loc	1 46
LM31:
 #APP
	cop2 0x00486012;
 #NO_APP

	.loc	1 48
LM32:
 #APP
	mfc2 $2, $9
 #NO_APP

	.loc	1 49
LM33:
	j	$31

	.loc	1 49
LM34:
	.end	control_then_store
	.def	two_vectors;	.val	two_vectors;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 52
LM35:

	.loc	1 52
LM36:
	.ent	two_vectors
two_vectors:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	a;	.val	4;	.scl	17;	.type	0x15;	.endef
	.def	b;	.val	5;	.scl	17;	.type	0x15;	.endef

	.loc	1 53
LM37:
$Lb8:
	.begin	$Lb8	2
	.def	x;	.val	3;	.scl	4;	.type	0x4;	.endef
	.def	y;	.val	2;	.scl	4;	.type	0x4;	.endef

	.loc	1 54
LM38:
$Le9:
	.bend	$Le9	3
 #APP
	lwc2 $0, 0( $4 );lwc2 $1, 4( $4 );lwc2 $2, 8( $4 )
 #NO_APP

	.loc	1 55
LM39:
 #APP
	cop2 0x00486012;
 #NO_APP

	.loc	1 56
LM40:
 #APP
	mfc2 $3, $9
 #NO_APP

	.loc	1 57
LM41:
 #APP
	lwc2 $0, 0( $5 );lwc2 $1, 4( $5 );lwc2 $2, 8( $5 )
 #NO_APP

	.loc	1 58
LM42:
 #APP
	nop;nop;cop2 0x01400006;
 #NO_APP

	.loc	1 59
LM43:
 #APP
	mfc2 $2, $9
 #NO_APP

	.loc	1 61
LM44:
	.set	noreorder
	.set	nomacro
	j	$31
	subu	$2,$3,$2
	.set	macro
	.set	reorder


	.loc	1 61
LM45:
	.end	two_vectors
