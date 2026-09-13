	.file	1 "c23_unions_enums.c"
gcc2_compiled.:
__gnu_compiled_c:
	.text
	.align	2
	.globl	describe
	.align	2
	.globl	bytes_of
	.align	2
	.globl	kind_size

	.text
	.def	Kind;	.scl	15;	.type	0xa;	.size	4;	.endef
	.def	KIND_NONE;	.val	0;	.scl	16;	.type	0xb;	.endef
	.def	KIND_INT;	.val	4;	.scl	16;	.type	0xb;	.endef
	.def	KIND_FLOAT;	.val	5;	.scl	16;	.type	0xb;	.endef
	.def	KIND_PTR;	.val	100;	.scl	16;	.type	0xb;	.endef
	.def	.eos;	.val	4;	.scl	102;	.tag	Kind;	.size	4;	.endef
	.def	Value;	.scl	12;	.type	0x9;	.size	4;	.endef
	.def	i;	.val	0;	.scl	11;	.type	0x4;	.endef
	.def	f;	.val	0;	.scl	11;	.type	0x6;	.endef
	.def	p;	.val	0;	.scl	11;	.type	0x11;	.endef
	.def	bytes;	.val	0;	.scl	11;	.dim	4;	.size	4;	.type	0x3c;	.endef
	.def	.eos;	.val	4;	.scl	102;	.tag	Value;	.size	4;	.endef
	.def	Tagged;	.scl	10;	.type	0x8;	.size	8;	.endef
	.def	kind;	.val	0;	.scl	8;	.tag	Kind;	.size	4;	.type	0xa;	.endef
	.def	value;	.val	4;	.scl	8;	.tag	Value;	.size	4;	.type	0x9;	.endef
	.def	.eos;	.val	8;	.scl	102;	.tag	Tagged;	.size	8;	.endef
	.def	describe;	.val	describe;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 9
LM1:

	.loc	1 9
LM2:
	.ent	describe
describe:
	.frame	$sp,24,$31		# vars= 0, regs= 1/0, args= 16, extra= 0
	.mask	0x80000000,-8
	.fmask	0x00000000,0
	.def	t;	.val	4;	.scl	17;	.tag	Tagged;	.size	8;	.type	0x18;	.endef
	subu	$sp,$sp,24
	sw	$31,16($sp)

	.loc	1 10
LM3:
	lw	$3,0($4)
	li	$2,5			# 0x00000005
	.set	noreorder
	.set	nomacro
	beq	$3,$2,$L4
	sltu	$2,$3,6
	.set	macro
	.set	reorder

	.set	noreorder
	.set	nomacro
	beq	$2,$0,$L8
	li	$2,4			# 0x00000004
	.set	macro
	.set	reorder

	.set	noreorder
	.set	nomacro
	beq	$3,$2,$L3
	li	$2,-1			# 0xffffffff
	.set	macro
	.set	reorder

	j	$L9
$L8:
	li	$2,100			# 0x00000064
	beq	$3,$2,$L5
	.set	noreorder
	.set	nomacro
	j	$L6
	li	$2,-1			# 0xffffffff
	.set	macro
	.set	reorder


	.loc	1 11
LM4:
$L3:
	lw	$2,4($4)
	j	$L9
$L4:

	.loc	1 12
LM5:
	lw	$4,4($4)
	jal	__fixsfsi
	j	$L9
$L5:

	.loc	1 13
LM6:
	lw	$2,4($4)
	#nop
	sltu	$2,$0,$2
$L6:

	.loc	1 14
LM7:
$L9:
	lw	$31,16($sp)
	#nop
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$sp,$sp,24
	.set	macro
	.set	reorder


	.loc	1 14
LM8:
	.end	describe
	.def	bytes_of;	.val	bytes_of;	.scl	2;	.type	0x2e;	.endef
	.text

	.loc	1 19
LM9:

	.loc	1 19
LM10:
	.ent	bytes_of
bytes_of:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	f;	.val	4;	.scl	17;	.type	0x6;	.endef

	.loc	1 20
LM11:
$Lb0:
	.begin	$Lb0	2
	.def	v;	.val	4;	.scl	4;	.tag	Value;	.size	4;	.type	0x9;	.endef

	.loc	1 22
LM12:
$Le1:
	.bend	$Le1	4
	andi	$2,$4,0x00ff
	srl	$4,$4,24
	sll	$4,$4,24

	.loc	1 23
LM13:
	.set	noreorder
	.set	nomacro
	j	$31
	or	$2,$2,$4
	.set	macro
	.set	reorder


	.loc	1 23
LM14:
	.end	bytes_of
	.def	kind_size;	.val	kind_size;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 25
LM15:

	.loc	1 25
LM16:
	.ent	kind_size
kind_size:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	k;	.val	4;	.scl	17;	.tag	Kind;	.size	4;	.type	0xa;	.endef
	sltu	$2,$0,$4
	.set	noreorder
	.set	nomacro
	j	$31
	sll	$2,$2,2
	.set	macro
	.set	reorder


	.loc	1 25
LM17:
	.end	kind_size
