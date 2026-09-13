	.file	1 "c26_l_names.c"
gcc2_compiled.:
__gnu_compiled_c:
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
	.ent	Lerp
Lerp:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
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

	.end	Lerp
	.align	2
	.globl	LoadLevel
	.ent	LoadLevel
LoadLevel:
	.frame	$sp,24,$31		# vars= 0, regs= 1/0, args= 16, extra= 0
	.mask	0x80000000,-8
	.fmask	0x00000000,0
	subu	$sp,$sp,24
	lui	$2,%hi(LevelTable) # high
	addiu	$2,$2,%lo(LevelTable) # low
	andi	$4,$4,0x0003
	sll	$4,$4,1
	addu	$4,$4,$2
	sw	$31,16($sp)
	lh	$4,0($4)
	jal	LookupExternal
	lui	$3,%hi(LevelCount) # high
	lw	$3,%lo(LevelCount)($3)
	lw	$31,16($sp)
	addu	$2,$2,$3
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$sp,$sp,24
	.set	macro
	.set	reorder

	.end	LoadLevel
	.align	2
	.globl	Lighten
	.ent	Lighten
Lighten:
	.frame	$sp,24,$31		# vars= 0, regs= 1/0, args= 16, extra= 0
	.mask	0x80000000,-8
	.fmask	0x00000000,0
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

	.end	Lighten
	.align	2
	.globl	LastLevel
	.ent	LastLevel
LastLevel:
	.frame	$sp,24,$31		# vars= 0, regs= 1/0, args= 16, extra= 0
	.mask	0x80000000,-8
	.fmask	0x00000000,0
	lui	$2,%hi(LevelCount) # high
	lw	$4,%lo(LevelCount)($2)
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

	.end	LastLevel

	.text
