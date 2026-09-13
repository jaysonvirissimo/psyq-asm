	.file	1 "c12_globals.c"
gcc2_compiled.:
__gnu_compiled_c:
	.globl	small_short
	.sdata
	.align	1
small_short:
	.half	7
	.text
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
	.def	Vec;	.scl	10;	.type	0x8;	.size	12;	.endef
	.def	x;	.val	0;	.scl	8;	.type	0x4;	.endef
	.def	y;	.val	4;	.scl	8;	.type	0x4;	.endef
	.def	z;	.val	8;	.scl	8;	.type	0x4;	.endef
	.def	.eos;	.val	12;	.scl	102;	.tag	Vec;	.size	12;	.endef
	.def	bump;	.val	bump;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 15
LM1:

	.loc	1 15
LM2:
	.ent	bump
bump:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0

	.loc	1 16
LM3:
	lw	$2,counter

	.loc	1 18
LM4:
	lh	$4,small_short

	.loc	1 16
LM5:
	addu	$2,$2,1
	sw	$2,counter

	.loc	1 17
LM6:
	lbu	$3,counter

	.loc	1 17
LM7:
	#nop
	sb	$3,small_char

	.loc	1 18
LM8:
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$2,$2,$4
	.set	macro
	.set	reorder


	.loc	1 18
LM9:
	.end	bump
	.def	total;	.val	total;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 21
LM10:

	.loc	1 21
LM11:
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


	.loc	1 21
LM12:
	.end	total
	.def	address_of;	.val	address_of;	.scl	2;	.type	0x64;	.endef
	.text

	.loc	1 22
LM13:

	.loc	1 22
LM14:
	.ent	address_of
address_of:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	which;	.val	4;	.scl	17;	.type	0x4;	.endef
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


	.loc	1 22
LM15:
	.end	address_of
	.def	dot_origin;	.val	dot_origin;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 23
LM16:

	.loc	1 23
LM17:
	.ent	dot_origin
dot_origin:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	v;	.val	4;	.scl	17;	.tag	Vec;	.size	12;	.type	0x18;	.endef
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


	.loc	1 23
LM18:
	.end	dot_origin
	.def	pi_twice;	.val	pi_twice;	.scl	2;	.type	0x27;	.endef
	.text

	.loc	1 24
LM19:

	.loc	1 24
LM20:
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


	.loc	1 24
LM21:
	.end	pi_twice
	.def	store_all;	.val	store_all;	.scl	2;	.type	0x21;	.endef
	.text

	.loc	1 27
LM22:

	.loc	1 27
LM23:
	.ent	store_all
store_all:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	value;	.val	4;	.scl	17;	.type	0x4;	.endef

	.loc	1 30
LM24:
	lui	$2,%hi(big_array+20) # high
	sw	$4,%lo(big_array+20)($2)

	.loc	1 31
LM25:
	lui	$2,%hi(origin+4) # high

	.loc	1 28
LM26:
	sw	$4,counter

	.loc	1 29
LM27:
	sw	$4,shared_total

	.loc	1 31
LM28:
	.set	noreorder
	.set	nomacro
	j	$31
	sw	$4,%lo(origin+4)($2)
	.set	macro
	.set	reorder


	.loc	1 31
LM29:
	.end	store_all
	.def	counter;	.val	counter;	.scl	2;	.type	0x4;	.endef
	.def	small_char;	.val	small_char;	.scl	2;	.type	0x2;	.endef
	.def	big_array;	.val	big_array;	.scl	2;	.dim	64;	.size	256;	.type	0x34;	.endef
	.def	small_short;	.val	small_short;	.scl	2;	.type	0x3;	.endef
	.def	origin;	.val	origin;	.scl	2;	.tag	Vec;	.size	12;	.type	0x8;	.endef
	.def	pi_value;	.val	pi_value;	.scl	2;	.type	0x7;	.endef
