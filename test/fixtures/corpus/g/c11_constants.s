	.file	1 "c11_constants.c"
gcc2_compiled.:
__gnu_compiled_c:
	.text
	.align	2
	.globl	ack_interrupts
	.align	2
	.globl	gpu_write
	.align	2
	.globl	magic
	.align	2
	.globl	negative
	.align	2
	.globl	masks
	.align	2
	.globl	in_range

	.text
	.def	ack_interrupts;	.val	ack_interrupts;	.scl	2;	.type	0x2e;	.endef
	.text

	.loc	1 9
LM1:

	.loc	1 9
LM2:
	.ent	ack_interrupts
ack_interrupts:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	bits;	.val	4;	.scl	17;	.type	0xe;	.endef

	.loc	1 10
LM3:
$Lb0:
	.begin	$Lb0	2
	.def	status;	.val	2;	.scl	4;	.type	0xe;	.endef
$Le1:
	.bend	$Le1	2
	li	$5,528482304			# 0x1f800000
	ori	$5,$5,0x1070

	.loc	1 12
LM4:
	li	$6,528482304			# 0x1f800000
	ori	$6,$6,0x1074

	.loc	1 10
LM5:
	#.set	volatile
	lw	$2,0($5)
	#.set	novolatile

	.loc	1 11
LM6:
	nor	$3,$0,$4
	#.set	volatile
	sw	$3,0($5)
	#.set	novolatile

	.loc	1 12
LM7:
	#.set	volatile
	lw	$3,0($6)
	#.set	novolatile
	#nop
	or	$3,$3,$4
	#.set	volatile
	sw	$3,0($6)
	#.set	novolatile

	.loc	1 14
LM8:
	j	$31

	.loc	1 14
LM9:
	.end	ack_interrupts
	.def	gpu_write;	.val	gpu_write;	.scl	2;	.type	0x21;	.endef
	.text

	.loc	1 16
LM10:

	.loc	1 16
LM11:
	.ent	gpu_write
gpu_write:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	value;	.val	4;	.scl	17;	.type	0xe;	.endef
	li	$2,528482304			# 0x1f800000
	ori	$2,$2,0x1810
	#.set	volatile
	sw	$4,0($2)
	#.set	novolatile
	j	$31

	.loc	1 16
LM12:
	.end	gpu_write
	.def	magic;	.val	magic;	.scl	2;	.type	0x2e;	.endef
	.text

	.loc	1 19
LM13:

	.loc	1 19
LM14:
	.ent	magic
magic:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	which;	.val	4;	.scl	17;	.type	0x4;	.endef

	.loc	1 20
LM15:
	andi	$4,$4,0x0003
	li	$2,1			# 0x00000001
	.set	noreorder
	.set	nomacro
	beq	$4,$2,$L6
	slt	$2,$4,2
	.set	macro
	.set	reorder

	beq	$2,$0,$L10
	beq	$4,$0,$L5
	.set	noreorder
	.set	nomacro
	j	$L12
	li	$2,2147418112			# 0x7fff0000
	.set	macro
	.set	reorder

$L10:
	li	$2,2			# 0x00000002
	.set	noreorder
	.set	nomacro
	beq	$4,$2,$L7
	li	$2,2147418112			# 0x7fff0000
	.set	macro
	.set	reorder

	j	$L12

	.loc	1 21
LM16:
$L5:
	li	$2,-559087616			# 0xdead0000
	.set	noreorder
	.set	nomacro
	j	$31
	ori	$2,$2,0xbeef
	.set	macro
	.set	reorder

$L6:

	.loc	1 22
LM17:
	.set	noreorder
	.set	nomacro
	j	$31
	li	$2,32768			# 0x00008000
	.set	macro
	.set	reorder

$L7:

	.loc	1 23
LM18:
	.set	noreorder
	.set	nomacro
	j	$31
	li	$2,65535			# 0x0000ffff
	.set	macro
	.set	reorder


	.loc	1 24
LM19:
$L12:
	.set	noreorder
	.set	nomacro
	j	$31
	ori	$2,$2,0xffff
	.set	macro
	.set	reorder


	.loc	1 24
LM20:
	.end	magic
	.def	negative;	.val	negative;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 28
LM21:

	.loc	1 28
LM22:
	.ent	negative
negative:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	li	$2,-131072			# 0xfffe0000
	.set	noreorder
	.set	nomacro
	j	$31
	ori	$2,$2,0xdcbb
	.set	macro
	.set	reorder


	.loc	1 28
LM23:
	.end	negative
	.def	masks;	.val	masks;	.scl	2;	.type	0x2e;	.endef
	.text

	.loc	1 29
LM24:

	.loc	1 29
LM25:
	.ent	masks
masks:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	x;	.val	4;	.scl	17;	.type	0xe;	.endef
	li	$2,-16777216			# 0xff000000
	ori	$2,$2,0xfff0
	and	$2,$4,$2
	.set	noreorder
	.set	nomacro
	j	$31
	ori	$2,$2,0x8001
	.set	macro
	.set	reorder


	.loc	1 29
LM26:
	.end	masks
	.def	in_range;	.val	in_range;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 30
LM27:

	.loc	1 30
LM28:
	.ent	in_range
in_range:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	x;	.val	4;	.scl	17;	.type	0x4;	.endef
	li	$2,32768			# 0x00008000
	addu	$4,$4,$2
	li	$2,65535			# 0x0000ffff
	sltu	$2,$2,$4
	.set	noreorder
	.set	nomacro
	j	$31
	xori	$2,$2,0x0001
	.set	macro
	.set	reorder


	.loc	1 30
LM29:
	.end	in_range
