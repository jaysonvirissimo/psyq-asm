	.file	1 "c14_extension.c"
gcc2_compiled.:
__gnu_compiled_c:
	.text
	.align	2
	.globl	sign_char
	.align	2
	.globl	zero_char
	.align	2
	.globl	sign_short
	.align	2
	.globl	zero_short
	.align	2
	.globl	narrow
	.align	2
	.globl	compare_unsigned
	.align	2
	.globl	compare_mixed
	.align	2
	.globl	add_bytes
	.align	2
	.globl	load_fields

	.text
	.def	sign_char;	.val	sign_char;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 4
LM1:

	.loc	1 4
LM2:
	.ent	sign_char
sign_char:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	c;	.val	4;	.scl	17;	.type	0x2;	.endef
	sll	$2,$4,24
	.set	noreorder
	.set	nomacro
	j	$31
	sra	$2,$2,24
	.set	macro
	.set	reorder


	.loc	1 4
LM3:
	.end	sign_char
	.def	zero_char;	.val	zero_char;	.scl	2;	.type	0x2e;	.endef
	.text

	.loc	1 5
LM4:

	.loc	1 5
LM5:
	.ent	zero_char
zero_char:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	c;	.val	4;	.scl	17;	.type	0xc;	.endef
	.set	noreorder
	.set	nomacro
	j	$31
	andi	$2,$4,0x00ff
	.set	macro
	.set	reorder


	.loc	1 5
LM6:
	.end	zero_char
	.def	sign_short;	.val	sign_short;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 6
LM7:

	.loc	1 6
LM8:
	.ent	sign_short
sign_short:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	s;	.val	4;	.scl	17;	.type	0x3;	.endef
	sll	$2,$4,16
	.set	noreorder
	.set	nomacro
	j	$31
	sra	$2,$2,15
	.set	macro
	.set	reorder


	.loc	1 6
LM9:
	.end	sign_short
	.def	zero_short;	.val	zero_short;	.scl	2;	.type	0x2e;	.endef
	.text

	.loc	1 7
LM10:

	.loc	1 7
LM11:
	.ent	zero_short
zero_short:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	s;	.val	4;	.scl	17;	.type	0xd;	.endef
	andi	$2,$4,0xffff
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$2,$2,1
	.set	macro
	.set	reorder


	.loc	1 7
LM12:
	.end	zero_short
	.def	narrow;	.val	narrow;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 10
LM13:

	.loc	1 10
LM14:
	.ent	narrow
narrow:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	x;	.val	4;	.scl	17;	.type	0x4;	.endef

	.loc	1 11
LM15:
$Lb0:
	.begin	$Lb0	2

	.loc	1 13
LM16:
$Le1:
	.bend	$Le1	4
	andi	$2,$4,0x00ff
	sll	$4,$4,16
	sra	$4,$4,16

	.loc	1 14
LM17:
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$2,$2,$4
	.set	macro
	.set	reorder


	.loc	1 14
LM18:
	.end	narrow
	.def	compare_unsigned;	.val	compare_unsigned;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 16
LM19:

	.loc	1 16
LM20:
	.ent	compare_unsigned
compare_unsigned:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	a;	.val	4;	.scl	17;	.type	0xe;	.endef
	.def	b;	.val	5;	.scl	17;	.type	0xe;	.endef
	sltu	$2,$4,$5
	bne	$2,$0,$L8
	addu	$2,$2,2
$L8:
	j	$31

	.loc	1 16
LM21:
	.end	compare_unsigned
	.def	compare_mixed;	.val	compare_mixed;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 17
LM22:

	.loc	1 17
LM23:
	.ent	compare_mixed
compare_mixed:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	a;	.val	4;	.scl	17;	.type	0x4;	.endef
	.def	b;	.val	5;	.scl	17;	.type	0xe;	.endef
	.set	noreorder
	.set	nomacro
	j	$31
	slt	$2,$4,$5
	.set	macro
	.set	reorder


	.loc	1 17
LM24:
	.end	compare_mixed
	.def	add_bytes;	.val	add_bytes;	.scl	2;	.type	0x2c;	.endef
	.text

	.loc	1 18
LM25:

	.loc	1 18
LM26:
	.ent	add_bytes
add_bytes:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	a;	.val	4;	.scl	17;	.type	0xc;	.endef
	.def	b;	.val	5;	.scl	17;	.type	0xc;	.endef
	addu	$2,$4,$5
	.set	noreorder
	.set	nomacro
	j	$31
	andi	$2,$2,0x00ff
	.set	macro
	.set	reorder


	.loc	1 18
LM27:
	.end	add_bytes
	.def	load_fields;	.val	load_fields;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 19
LM28:

	.loc	1 19
LM29:
	.ent	load_fields
load_fields:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	p;	.val	4;	.scl	17;	.type	0x1c;	.endef
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


	.loc	1 19
LM30:
	.end	load_fields
