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
	.def	Flags;	.scl	10;	.type	0x8;	.size	4;	.endef
	.def	visible;	.val	0;	.scl	18;	.type	0xe;	.size	1;	.endef
	.def	layer;	.val	1;	.scl	18;	.type	0xe;	.size	3;	.endef
	.def	depth;	.val	4;	.scl	18;	.type	0x4;	.size	5;	.endef
	.def	color;	.val	9;	.scl	18;	.type	0xe;	.size	7;	.endef
	.def	wide;	.val	16;	.scl	18;	.type	0xe;	.size	16;	.endef
	.def	.eos;	.val	4;	.scl	102;	.tag	Flags;	.size	4;	.endef
	.def	is_visible;	.val	is_visible;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 12
LM1:

	.loc	1 12
LM2:
	.ent	is_visible
is_visible:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	f;	.val	4;	.scl	17;	.tag	Flags;	.size	4;	.type	0x18;	.endef
	lw	$2,0($4)
	.set	noreorder
	.set	nomacro
	j	$31
	andi	$2,$2,0x0001
	.set	macro
	.set	reorder


	.loc	1 12
LM3:
	.end	is_visible
	.def	set_layer;	.val	set_layer;	.scl	2;	.type	0x21;	.endef
	.text

	.loc	1 13
LM4:

	.loc	1 13
LM5:
	.ent	set_layer
set_layer:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	f;	.val	4;	.scl	17;	.tag	Flags;	.size	4;	.type	0x18;	.endef
	.def	layer;	.val	5;	.scl	17;	.type	0x4;	.endef
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


	.loc	1 13
LM6:
	.end	set_layer
	.def	get_depth;	.val	get_depth;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 14
LM7:

	.loc	1 14
LM8:
	.ent	get_depth
get_depth:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	f;	.val	4;	.scl	17;	.tag	Flags;	.size	4;	.type	0x18;	.endef
	lw	$2,0($4)
	#nop
	sll	$2,$2,23
	.set	noreorder
	.set	nomacro
	j	$31
	sra	$2,$2,27
	.set	macro
	.set	reorder


	.loc	1 14
LM9:
	.end	get_depth
	.def	pack;	.val	pack;	.scl	2;	.type	0x21;	.endef
	.text

	.loc	1 17
LM10:

	.loc	1 17
LM11:
	.ent	pack
pack:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	f;	.val	4;	.scl	17;	.tag	Flags;	.size	4;	.type	0x18;	.endef
	.def	color;	.val	5;	.scl	17;	.type	0x4;	.endef
	.def	wide;	.val	6;	.scl	17;	.type	0x4;	.endef

	.loc	1 18
LM12:
	li	$3,-65536			# 0xffff0000
	ori	$3,$3,0x01ff
	andi	$5,$5,0x007f
	lw	$2,0($4)
	sll	$5,$5,9
	and	$2,$2,$3
	or	$2,$2,$5
	sw	$2,0($4)

	.loc	1 19
LM13:
	sh	$6,2($4)

	.loc	1 20
LM14:
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


	.loc	1 20
LM15:
	.end	pack
	.def	combine;	.val	combine;	.scl	2;	.type	0x2e;	.endef
	.text

	.loc	1 23
LM16:

	.loc	1 23
LM17:
	.ent	combine
combine:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	f;	.val	4;	.scl	17;	.tag	Flags;	.size	4;	.type	0x18;	.endef
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


	.loc	1 23
LM18:
	.end	combine
