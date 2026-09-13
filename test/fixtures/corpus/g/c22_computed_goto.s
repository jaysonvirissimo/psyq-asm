	.file	1 "c22_computed_goto.c"
gcc2_compiled.:
__gnu_compiled_c:
	.data
	.align	2
table.2:
	.word	$L2
	.word	$L3
	.word	$L4
	.word	$L5
	.text
	.align	2
	.globl	dispatch
	.data
	.align	2
ops.5:
	.word	$L7
	.word	$L8
	.word	$L9
	.text
	.align	2
	.globl	interpreter

	.text
	.def	dispatch;	.val	dispatch;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 5
LM1:

	.loc	1 5
LM2:
	.ent	dispatch
dispatch:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	op;	.val	4;	.scl	17;	.type	0x4;	.endef
	.def	value;	.val	5;	.scl	17;	.type	0x4;	.endef

	.loc	1 6
LM3:
$Lb0:
	.begin	$Lb0	2
	.def	table;	.val	table.2;	.scl	3;	.dim	4;	.size	16;	.type	0x71;	.endef

	.loc	1 7
LM4:
	lui	$2,%hi(table.2) # high
	addiu	$2,$2,%lo(table.2) # low
	andi	$4,$4,0x0003
	sll	$4,$4,2
	addu	$4,$4,$2
	lw	$2,0($4)
	#nop
	j	$2
	.def	add;	.val	$L2;	.scl	6;	.type	0x0;	.endef
$L2:

	.loc	1 10
LM5:
	.set	noreorder
	.set	nomacro
	j	$L5
	addu	$5,$5,1
	.set	macro
	.set	reorder

	.def	sub;	.val	$L3;	.scl	6;	.type	0x0;	.endef
$L3:

	.loc	1 13
LM6:
	.set	noreorder
	.set	nomacro
	j	$L5
	addu	$5,$5,-1
	.set	macro
	.set	reorder

	.def	neg;	.val	$L4;	.scl	6;	.type	0x0;	.endef
$L4:

	.loc	1 15
LM7:
	subu	$5,$0,$5
	.def	done;	.val	$L5;	.scl	6;	.type	0x0;	.endef
$L5:

	.loc	1 17
LM8:
$Le1:
	.bend	$Le1	13

	.loc	1 18
LM9:
	.set	noreorder
	.set	nomacro
	j	$31
	move	$2,$5
	.set	macro
	.set	reorder


	.loc	1 18
LM10:
	.end	dispatch
	.def	interpreter;	.val	interpreter;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 21
LM11:

	.loc	1 21
LM12:
	.ent	interpreter
interpreter:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	code;	.val	6;	.scl	17;	.type	0x1c;	.endef
$Lb2:
	.begin	$Lb2	1
	.def	ops;	.val	ops.5;	.scl	3;	.dim	3;	.size	12;	.type	0x71;	.endef
	.def	acc;	.val	7;	.scl	4;	.type	0x4;	.endef
	move	$6,$4

	.loc	1 24
LM13:
	lbu	$3,0($6)
	li	$2,-1431655765			# 0xaaaaaaab
	multu	$3,$2

	.loc	1 23
LM14:
	move	$7,$0

	.loc	1 24
LM15:
	lui	$5,%hi(ops.5) # high
	addiu	$5,$5,%lo(ops.5) # low
	mfhi	$8
	#nop
	#nop
	srl	$4,$8,1
	sll	$2,$4,1
	addu	$2,$2,$4
	subu	$3,$3,$2
	andi	$3,$3,0x00ff
	sll	$3,$3,2
	addu	$3,$3,$5
	lw	$2,0($3)
	#nop
	.set	noreorder
	.set	nomacro
	j	$2
	addu	$6,$6,1
	.set	macro
	.set	reorder

	.def	op_inc;	.val	$L8;	.scl	6;	.type	0x0;	.endef
$L8:

	.loc	1 27
LM16:
	lbu	$3,0($6)
	li	$2,-1431655765			# 0xaaaaaaab
	multu	$3,$2

	.loc	1 26
LM17:
	addu	$7,$7,1

	.loc	1 27
LM18:
	lui	$5,%hi(ops.5) # high
	addiu	$5,$5,%lo(ops.5) # low
	mfhi	$8
	#nop
	#nop
	srl	$4,$8,1
	sll	$2,$4,1
	addu	$2,$2,$4
	subu	$3,$3,$2
	andi	$3,$3,0x00ff
	sll	$3,$3,2
	addu	$3,$3,$5
	lw	$2,0($3)
	#nop
	.set	noreorder
	.set	nomacro
	j	$2
	addu	$6,$6,1
	.set	macro
	.set	reorder

	.def	op_dbl;	.val	$L9;	.scl	6;	.type	0x0;	.endef
$L9:

	.loc	1 30
LM19:
	lbu	$3,0($6)
	li	$2,-1431655765			# 0xaaaaaaab
	multu	$3,$2

	.loc	1 29
LM20:
	sll	$7,$7,1

	.loc	1 30
LM21:
	lui	$5,%hi(ops.5) # high
	addiu	$5,$5,%lo(ops.5) # low
	mfhi	$8
	#nop
	#nop
	srl	$4,$8,1
	sll	$2,$4,1
	addu	$2,$2,$4
	subu	$3,$3,$2
	andi	$3,$3,0x00ff
	sll	$3,$3,2
	addu	$3,$3,$5
	lw	$2,0($3)
	#nop
	.set	noreorder
	.set	nomacro
	j	$2
	addu	$6,$6,1
	.set	macro
	.set	reorder

	.def	op_halt;	.val	$L7;	.scl	6;	.type	0x0;	.endef
$L7:

	.loc	1 32
LM22:
$Le3:
	.bend	$Le3	12

	.loc	1 33
LM23:
	.set	noreorder
	.set	nomacro
	j	$31
	move	$2,$7
	.set	macro
	.set	reorder


	.loc	1 33
LM24:
	.end	interpreter
