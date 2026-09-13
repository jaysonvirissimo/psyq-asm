	.file	1 "c26_l_names.c"
gcc2_compiled.:
__gnu_compiled_c:
	.data
	.text
	.data
	.align	2
LevelTable:
	.half	3
	.half	1
	.half	4
	.half	1
	.half	5
	.text
	.align	2
	.align	2
	.globl	LoadLevel
	.align	2
	.globl	Lighten
	.align	2
	.globl	LastLevel

	.extern	LevelCount, 4

	.text
	.def	Lerp;	.val	Lerp;	.scl	3;	.type	0x24;	.endef
	.text

	.loc	1 10
LM1:

	.loc	1 10
LM2:
	.ent	Lerp
Lerp:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	a;	.val	4;	.scl	17;	.type	0x4;	.endef
	.def	b;	.val	5;	.scl	17;	.type	0x4;	.endef
	.def	t;	.val	6;	.scl	17;	.type	0x4;	.endef
	subu	$5,$5,$4
	mult	$5,$6
	mflo	$3
	#nop
	#nop
	sra	$2,$3,8
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$2,$4,$2
	.set	macro
	.set	reorder


	.loc	1 10
LM3:
	.end	Lerp
	.def	LoadLevel;	.val	LoadLevel;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 12
LM4:

	.loc	1 12
LM5:
	.ent	LoadLevel
LoadLevel:
	.frame	$sp,24,$31		# vars= 0, regs= 1/0, args= 16, extra= 0
	.mask	0x80000000,-8
	.fmask	0x00000000,0
	.def	index;	.val	4;	.scl	17;	.type	0x4;	.endef
	subu	$sp,$sp,24
	lui	$2,%hi(LevelTable) # high
	addiu	$2,$2,%lo(LevelTable) # low
	andi	$4,$4,0x0003
	sll	$4,$4,1
	addu	$4,$4,$2
	sw	$31,16($sp)
	lh	$4,0($4)
	jal	LookupExternal
	lw	$3,LevelCount
	lw	$31,16($sp)
	addu	$2,$2,$3
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$sp,$sp,24
	.set	macro
	.set	reorder


	.loc	1 12
LM6:
	.end	LoadLevel
	.def	Lighten;	.val	Lighten;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 14
LM7:

	.loc	1 14
LM8:
	.ent	Lighten
Lighten:
	.frame	$sp,24,$31		# vars= 0, regs= 1/0, args= 16, extra= 0
	.mask	0x80000000,-8
	.fmask	0x00000000,0
	.def	value;	.val	4;	.scl	17;	.type	0x4;	.endef
	subu	$sp,$sp,24
	li	$5,255			# 0x000000ff
	sw	$31,16($sp)
	.set	noreorder
	.set	nomacro
	jal	Lerp
	li	$6,64			# 0x00000040
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


	.loc	1 14
LM9:
	.end	Lighten
	.def	LastLevel;	.val	LastLevel;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 16
LM10:

	.loc	1 16
LM11:
	.ent	LastLevel
LastLevel:
	.frame	$sp,24,$31		# vars= 0, regs= 1/0, args= 16, extra= 0
	.mask	0x80000000,-8
	.fmask	0x00000000,0
	lw	$4,LevelCount
	subu	$sp,$sp,24
	sw	$31,16($sp)
	jal	Lighten
	lui	$3,%hi(LevelTable+8) # high
	lh	$3,%lo(LevelTable+8)($3)
	lw	$31,16($sp)
	addu	$2,$3,$2
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$sp,$sp,24
	.set	macro
	.set	reorder


	.loc	1 16
LM12:
	.end	LastLevel
	.def	LevelTable;	.val	LevelTable;	.scl	3;	.dim	5;	.size	10;	.type	0x33;	.endef
