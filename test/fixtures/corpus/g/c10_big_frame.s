	.file	1 "c10_big_frame.c"
gcc2_compiled.:
__gnu_compiled_c:
	.text
	.align	2
	.globl	big_buffer
	.align	2
	.globl	huge_locals
	.align	2
	.globl	medium_frame

	.text
	.def	big_buffer;	.val	big_buffer;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 7
LM1:

	.loc	1 7
LM2:
	.ent	big_buffer
big_buffer:
	.frame	$sp,40024,$31		# vars= 40000, regs= 2/0, args= 16, extra= 0
	.mask	0x80010000,-4
	.fmask	0x00000000,0
	.def	index;	.val	16;	.scl	17;	.type	0x4;	.endef
$Lb0:
	.begin	$Lb0	1
	.def	buffer;	.val	-40008;	.scl	1;	.dim	40000;	.size	40000;	.type	0x32;	.endef
$Le1:
	.bend	$Le1	1
	li	$12,40024			# 0x00009c58
	subu	$sp,$sp,$12
	addu	$13,$12,$sp
	sw	$16,-8($13)
	move	$16,$4

	.loc	1 9
LM3:
	addu	$4,$sp,16

	.loc	1 7
LM4:
	sw	$31,-4($13)

	.loc	1 9
LM5:
	.set	noreorder
	.set	nomacro
	jal	fill
	li	$5,40000			# 0x00009c40
	.set	macro
	.set	reorder


	.loc	1 10
LM6:
	andi	$16,$16,0x7fff
	addu	$2,$sp,16
	addu	$16,$2,$16
	li	$3,32768			# 0x00008000
	addu	$2,$2,$3

	.loc	1 11
LM7:
	li	$12,40024			# 0x00009c58
	addu	$13,$12,$sp

	.loc	1 10
LM8:
	lbu	$3,0($16)
	lbu	$2,7231($2)

	.loc	1 11
LM9:
	lw	$31,-4($13)
	lw	$16,-8($13)

	.loc	1 10
LM10:
	addu	$2,$3,$2

	.loc	1 11
LM11:
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$sp,$sp,$12
	.set	macro
	.set	reorder


	.loc	1 11
LM12:
	.end	big_buffer
	.def	huge_locals;	.val	huge_locals;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 14
LM13:

	.loc	1 14
LM14:
	.ent	huge_locals
huge_locals:
	.frame	$sp,80000,$31		# vars= 80000, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	n;	.val	4;	.scl	17;	.type	0x4;	.endef
$Lb2:
	.begin	$Lb2	1
	.def	table;	.val	-80000;	.scl	1;	.dim	20000;	.size	80000;	.type	0x34;	.endef
	.def	i;	.val	5;	.scl	4;	.type	0x4;	.endef
	li	$12,65536			# 0x00010000
	ori	$12,$12,0x3880
	subu	$sp,$sp,$12

	.loc	1 17
LM15:
	li	$5,19999			# 0x00004e1f
	li	$2,65536			# 0x00010000
	ori	$2,$2,0x387c
	addu	$3,$sp,$2
	sll	$2,$4,2
	addu	$2,$2,$4
	sll	$2,$2,3
	subu	$2,$2,$4
	sll	$2,$2,4
	addu	$2,$2,$4
	sll	$2,$2,5
	subu	$2,$2,$4
$L6:

	.loc	1 18
LM16:
	sw	$2,0($3)

	.loc	1 17
LM17:
	addu	$3,$3,-4
	addu	$5,$5,-1
	.set	noreorder
	.set	nomacro
	bgez	$5,$L6
	subu	$2,$2,$4
	.set	macro
	.set	reorder


	.loc	1 19
LM18:
$Le3:
	.bend	$Le3	6
	andi	$2,$4,0x3fff
	sll	$2,$2,2
	addu	$2,$sp,$2
	lw	$2,0($2)

	.loc	1 20
LM19:
	li	$12,65536			# 0x00010000
	ori	$12,$12,0x3880
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$sp,$sp,$12
	.set	macro
	.set	reorder


	.loc	1 20
LM20:
	.end	huge_locals
	.def	medium_frame;	.val	medium_frame;	.scl	2;	.type	0x21;	.endef
	.text

	.loc	1 23
LM21:

	.loc	1 23
LM22:
	.ent	medium_frame
medium_frame:
	.frame	$sp,2072,$31		# vars= 2048, regs= 1/0, args= 16, extra= 0
	.mask	0x80000000,-8
	.fmask	0x00000000,0
	.def	a;	.val	4;	.scl	17;	.type	0x4;	.endef
$Lb4:
	.begin	$Lb4	1
	.def	scratch;	.val	-2056;	.scl	1;	.dim	1024;	.size	2048;	.type	0x33;	.endef
$Le5:
	.bend	$Le5	1
	subu	$sp,$sp,2072

	.loc	1 25
LM23:
	andi	$2,$4,0x03ff
	sll	$2,$2,1
	addu	$3,$sp,16
	addu	$2,$3,$2

	.loc	1 23
LM24:
	sw	$31,2064($sp)

	.loc	1 25
LM25:
	sh	$4,0($2)

	.loc	1 26
LM26:
	move	$4,$3
	.set	noreorder
	.set	nomacro
	jal	fill
	li	$5,2048			# 0x00000800
	.set	macro
	.set	reorder


	.loc	1 27
LM27:
	lw	$31,2064($sp)
	#nop
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$sp,$sp,2072
	.set	macro
	.set	reorder


	.loc	1 27
LM28:
	.end	medium_frame
