	.file	1 "c18_loops.c"
gcc2_compiled.:
__gnu_compiled_c:
	.text
	.align	2
	.globl	count_bits
	.align	2
	.globl	find_first
	.align	2
	.globl	reverse
	.align	2
	.globl	nested_break
	.align	2
	.globl	checksum

	.text
	.def	count_bits;	.val	count_bits;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 5
LM1:

	.loc	1 5
LM2:
	.ent	count_bits
count_bits:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	x;	.val	4;	.scl	17;	.type	0xe;	.endef

	.loc	1 6
LM3:
$Lb0:
	.begin	$Lb0	2
	.def	n;	.val	3;	.scl	4;	.type	0x4;	.endef

	.loc	1 7
LM4:
	.set	noreorder
	.set	nomacro
	beq	$4,$0,$L3
	move	$3,$0
	.set	macro
	.set	reorder

$L4:

	.loc	1 8
LM5:
	andi	$2,$4,0x0001

	.loc	1 9
LM6:
	srl	$4,$4,1

	.loc	1 10
LM7:
	.set	noreorder
	.set	nomacro
	bne	$4,$0,$L4
	addu	$3,$3,$2
	.set	macro
	.set	reorder

$L3:

	.loc	1 11
LM8:
$Le1:
	.bend	$Le1	7

	.loc	1 12
LM9:
	.set	noreorder
	.set	nomacro
	j	$31
	move	$2,$3
	.set	macro
	.set	reorder


	.loc	1 12
LM10:
	.end	count_bits
	.def	find_first;	.val	find_first;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 15
LM11:

	.loc	1 15
LM12:
	.ent	find_first
find_first:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	a;	.val	4;	.scl	17;	.type	0x14;	.endef
	.def	n;	.val	5;	.scl	17;	.type	0x4;	.endef
	.def	key;	.val	6;	.scl	17;	.type	0x4;	.endef

	.loc	1 16
LM13:
$Lb2:
	.begin	$Lb2	2
	.def	i;	.val	3;	.scl	4;	.type	0x4;	.endef

	.loc	1 17
LM14:
	.set	noreorder
	.set	nomacro
	blez	$5,$L8
	move	$3,$0
	.set	macro
	.set	reorder

$L10:

	.loc	1 18
LM15:
	lw	$2,0($4)
	#nop
	bltz	$2,$L9

	.loc	1 20
LM16:
	beq	$2,$6,$L8

	.loc	1 17
LM17:
$L9:
	addu	$3,$3,1
	slt	$2,$3,$5
	.set	noreorder
	.set	nomacro
	bne	$2,$0,$L10
	addu	$4,$4,4
	.set	macro
	.set	reorder

$L8:

	.loc	1 23
LM18:
$Le3:
	.bend	$Le3	9

	.loc	1 24
LM19:
	.set	noreorder
	.set	nomacro
	j	$31
	move	$2,$3
	.set	macro
	.set	reorder


	.loc	1 24
LM20:
	.end	find_first
	.def	reverse;	.val	reverse;	.scl	2;	.type	0x21;	.endef
	.text

	.loc	1 27
LM21:

	.loc	1 27
LM22:
	.ent	reverse
reverse:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	s;	.val	8;	.scl	17;	.type	0x12;	.endef
	.def	n;	.val	5;	.scl	17;	.type	0x4;	.endef
$Lb4:
	.begin	$Lb4	1
	.def	i;	.val	6;	.scl	4;	.type	0x4;	.endef
	.def	j;	.val	7;	.scl	4;	.type	0x4;	.endef
	move	$8,$4

	.loc	1 28
LM23:
	addu	$7,$5,-1

	.loc	1 29
LM24:
	.set	noreorder
	.set	nomacro
	blez	$7,$L19
	move	$6,$0
	.set	macro
	.set	reorder

$L17:

	.loc	1 30
LM25:
$Lb5:
	.begin	$Lb5	4
	.def	t;	.val	5;	.scl	4;	.type	0x2;	.endef
$Le6:
	.bend	$Le6	4
	addu	$4,$8,$6

	.loc	1 31
LM26:
	addu	$6,$6,1
	addu	$3,$8,$7

	.loc	1 30
LM27:
	lbu	$5,0($4)

	.loc	1 31
LM28:
	lbu	$2,0($3)

	.loc	1 32
LM29:
	addu	$7,$7,-1

	.loc	1 31
LM30:
	sb	$2,0($4)

	.loc	1 33
LM31:
	slt	$2,$6,$7

	.loc	1 33
LM32:
	.set	noreorder
	.set	nomacro
	bne	$2,$0,$L17
	sb	$5,0($3)
	.set	macro
	.set	reorder


	.loc	1 34
LM33:
$Le7:
	.bend	$Le7	8
$L19:
	j	$31

	.loc	1 34
LM34:
	.end	reverse
	.def	nested_break;	.val	nested_break;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 37
LM35:

	.loc	1 37
LM36:
	.ent	nested_break
nested_break:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	n;	.val	4;	.scl	17;	.type	0x4;	.endef

	.loc	1 38
LM37:
$Lb8:
	.begin	$Lb8	2
	.def	i;	.val	6;	.scl	4;	.type	0x4;	.endef
	.def	j;	.val	5;	.scl	4;	.type	0x4;	.endef
	.def	found;	.val	7;	.scl	4;	.type	0x4;	.endef
	li	$7,-1			# 0xffffffff

	.loc	1 39
LM38:
	.set	noreorder
	.set	nomacro
	blez	$4,$L22
	move	$6,$0
	.set	macro
	.set	reorder

$L32:
	bgez	$7,$L22

	.loc	1 40
LM39:
	.set	noreorder
	.set	nomacro
	blez	$4,$L23
	move	$5,$0
	.set	macro
	.set	reorder

	move	$3,$5
$L29:

	.loc	1 41
LM40:
	bne	$3,$4,$L28

	.loc	1 43
LM41:
	.set	noreorder
	.set	nomacro
	j	$L23
	move	$7,$6
	.set	macro
	.set	reorder


	.loc	1 40
LM42:
$L28:
	addu	$5,$5,1
	slt	$2,$5,$4
	.set	noreorder
	.set	nomacro
	bne	$2,$0,$L29
	addu	$3,$3,$6
	.set	macro
	.set	reorder


	.loc	1 39
LM43:
$L23:
	addu	$6,$6,1
	slt	$2,$6,$4
	bne	$2,$0,$L32
$L22:

	.loc	1 45
LM44:
$Le9:
	.bend	$Le9	9

	.loc	1 46
LM45:
	.set	noreorder
	.set	nomacro
	j	$31
	move	$2,$7
	.set	macro
	.set	reorder


	.loc	1 46
LM46:
	.end	nested_break
	.def	checksum;	.val	checksum;	.scl	2;	.type	0x2e;	.endef
	.text

	.loc	1 49
LM47:

	.loc	1 49
LM48:
	.ent	checksum
checksum:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	p;	.val	4;	.scl	17;	.type	0x1c;	.endef
	.def	n;	.val	5;	.scl	17;	.type	0x4;	.endef

	.loc	1 50
LM49:
$Lb10:
	.begin	$Lb10	2
	.def	a;	.val	6;	.scl	4;	.type	0xe;	.endef
	.def	b;	.val	7;	.scl	4;	.type	0xe;	.endef
	li	$6,1			# 0x00000001
	move	$7,$0

	.loc	1 51
LM50:
	li	$8,-2146992015			# 0x80078071
$L34:

	.loc	1 52
LM51:
	lbu	$3,0($4)
	#nop
	addu	$3,$6,$3
	multu	$3,$8
	mfhi	$9
	#nop
	#nop
	srl	$6,$9,15
	sll	$2,$6,12
	subu	$2,$2,$6
	sll	$2,$2,4
	addu	$2,$2,$6
	subu	$6,$3,$2

	.loc	1 53
LM52:
	addu	$3,$7,$6
	multu	$3,$8

	.loc	1 52
LM53:
	addu	$4,$4,1

	.loc	1 54
LM54:
	addu	$5,$5,-1

	.loc	1 53
LM55:
	mfhi	$9
	#nop
	#nop
	srl	$7,$9,15
	sll	$2,$7,12
	subu	$2,$2,$7
	sll	$2,$2,4
	addu	$2,$2,$7

	.loc	1 54
LM56:
	.set	noreorder
	.set	nomacro
	bgtz	$5,$L34
	subu	$7,$3,$2
	.set	macro
	.set	reorder


	.loc	1 55
LM57:
$Le11:
	.bend	$Le11	7
	sll	$2,$7,16

	.loc	1 56
LM58:
	.set	noreorder
	.set	nomacro
	j	$31
	or	$2,$2,$6
	.set	macro
	.set	reorder


	.loc	1 56
LM59:
	.end	checksum
