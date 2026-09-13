	.file	1 "c20_memory.c"
gcc2_compiled.:
__gnu_compiled_c:
	.text
	.align	2
	.globl	copy_bytes
	.align	2
	.globl	zero_words
	.align	2
	.globl	compare_strings
	.align	2
	.globl	string_length
	.align	2
	.globl	fill_pattern
	.align	2
	.globl	clear_block

	.text
	.def	copy_bytes;	.val	copy_bytes;	.scl	2;	.type	0x21;	.endef
	.text

	.loc	1 5
LM1:

	.loc	1 5
LM2:
	.ent	copy_bytes
copy_bytes:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	dst;	.val	4;	.scl	17;	.type	0x12;	.endef
	.def	src;	.val	5;	.scl	17;	.type	0x12;	.endef
	.def	n;	.val	6;	.scl	17;	.type	0x4;	.endef

	.loc	1 6
LM3:
	move	$2,$6
	.set	noreorder
	.set	nomacro
	blez	$2,$L6
	addu	$6,$6,-1
	.set	macro
	.set	reorder

$L4:

	.loc	1 7
LM4:
	lbu	$2,0($5)
	addu	$5,$5,1
	move	$3,$6
	addu	$6,$6,-1
	sb	$2,0($4)
	.set	noreorder
	.set	nomacro
	bgtz	$3,$L4
	addu	$4,$4,1
	.set	macro
	.set	reorder

$L6:
	j	$31

	.loc	1 7
LM5:
	.end	copy_bytes
	.def	zero_words;	.val	zero_words;	.scl	2;	.type	0x21;	.endef
	.text

	.loc	1 11
LM6:

	.loc	1 11
LM7:
	.ent	zero_words
zero_words:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	p;	.val	4;	.scl	17;	.type	0x14;	.endef
	.def	n;	.val	5;	.scl	17;	.type	0x4;	.endef

	.loc	1 12
LM8:
$Lb0:
	.begin	$Lb0	2
	.def	i;	.val	3;	.scl	4;	.type	0x4;	.endef

	.loc	1 13
LM9:
	.set	noreorder
	.set	nomacro
	blez	$5,$L13
	move	$3,$0
	.set	macro
	.set	reorder

$L11:

	.loc	1 14
LM10:
	sw	$0,0($4)

	.loc	1 13
LM11:
	addu	$3,$3,1
	slt	$2,$3,$5
	.set	noreorder
	.set	nomacro
	bne	$2,$0,$L11
	addu	$4,$4,4
	.set	macro
	.set	reorder


	.loc	1 15
LM12:
$Le1:
	.bend	$Le1	5
$L13:
	j	$31

	.loc	1 15
LM13:
	.end	zero_words
	.def	compare_strings;	.val	compare_strings;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 18
LM14:

	.loc	1 18
LM15:
	.ent	compare_strings
compare_strings:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	a;	.val	4;	.scl	17;	.type	0x12;	.endef
	.def	b;	.val	5;	.scl	17;	.type	0x12;	.endef

	.loc	1 19
LM16:
	lbu	$3,0($4)
	#nop
	beq	$3,$0,$L16
$L19:
	lbu	$2,0($5)
	#nop
	bne	$3,$2,$L16

	.loc	1 20
LM17:
	addu	$4,$4,1

	.loc	1 22
LM18:
	lbu	$3,0($4)

	.loc	1 22
LM19:
	#nop
	.set	noreorder
	.set	nomacro
	bne	$3,$0,$L19
	addu	$5,$5,1
	.set	macro
	.set	reorder

$L16:

	.loc	1 23
LM20:
	lbu	$3,0($4)
	lbu	$2,0($5)
	.set	noreorder
	.set	nomacro
	j	$31
	subu	$2,$3,$2
	.set	macro
	.set	reorder


	.loc	1 23
LM21:
	.end	compare_strings
	.def	string_length;	.val	string_length;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 27
LM22:

	.loc	1 27
LM23:
	.ent	string_length
string_length:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	s;	.val	4;	.scl	17;	.type	0x12;	.endef

	.loc	1 28
LM24:
$Lb2:
	.begin	$Lb2	2
	.def	p;	.val	3;	.scl	4;	.type	0x12;	.endef

	.loc	1 29
LM25:
	lbu	$2,0($4)

	.loc	1 29
LM26:
	#nop
	.set	noreorder
	.set	nomacro
	beq	$2,$0,$L22
	move	$3,$4
	.set	macro
	.set	reorder


	.loc	1 30
LM27:
	addu	$3,$3,1
$L25:
	lbu	$2,0($3)
	#nop
	.set	noreorder
	.set	nomacro
	bne	$2,$0,$L25
	addu	$3,$3,1
	.set	macro
	.set	reorder

	addu	$3,$3,-1
$L22:

	.loc	1 31
LM28:
$Le3:
	.bend	$Le3	5

	.loc	1 32
LM29:
	.set	noreorder
	.set	nomacro
	j	$31
	subu	$2,$3,$4
	.set	macro
	.set	reorder


	.loc	1 32
LM30:
	.end	string_length
	.def	fill_pattern;	.val	fill_pattern;	.scl	2;	.type	0x21;	.endef
	.text

	.loc	1 35
LM31:

	.loc	1 35
LM32:
	.ent	fill_pattern
fill_pattern:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	p;	.val	4;	.scl	17;	.type	0x1d;	.endef
	.def	n;	.val	3;	.scl	17;	.type	0x4;	.endef
	.def	value;	.val	6;	.scl	17;	.type	0xd;	.endef

	.loc	1 36
LM33:
	.set	noreorder
	.set	nomacro
	beq	$5,$0,$L31
	addu	$3,$5,-1
	.set	macro
	.set	reorder

	li	$5,-1			# 0xffffffff
$L29:

	.loc	1 37
LM34:
	xor	$2,$6,$3
	sh	$2,0($4)
	addu	$3,$3,-1
	.set	noreorder
	.set	nomacro
	bne	$3,$5,$L29
	addu	$4,$4,2
	.set	macro
	.set	reorder

$L31:
	j	$31

	.loc	1 37
LM35:
	.end	fill_pattern
	.def	Block;	.scl	10;	.type	0x8;	.size	64;	.endef
	.def	header;	.val	0;	.scl	8;	.type	0x4;	.endef
	.def	payload;	.val	4;	.scl	8;	.dim	60;	.size	60;	.type	0x32;	.endef
	.def	.eos;	.val	64;	.scl	102;	.tag	Block;	.size	64;	.endef
	.def	clear_block;	.val	clear_block;	.scl	2;	.type	0x21;	.endef
	.text

	.loc	1 43
LM36:

	.loc	1 43
LM37:
	.ent	clear_block
clear_block:
	.frame	$sp,88,$31		# vars= 64, regs= 2/0, args= 16, extra= 0
	.mask	0x80010000,-4
	.fmask	0x00000000,0
	.def	b;	.val	16;	.scl	17;	.tag	Block;	.size	64;	.type	0x18;	.endef
$Lb4:
	.begin	$Lb4	1
	.def	empty;	.val	-72;	.scl	1;	.tag	Block;	.size	64;	.type	0x8;	.endef
	subu	$sp,$sp,88
	sw	$16,80($sp)
	move	$16,$4

	.loc	1 44
LM38:
	addu	$4,$sp,16
	move	$5,$0

	.loc	1 43
LM39:
	sw	$31,84($sp)

	.loc	1 44
LM40:
	.set	noreorder
	.set	nomacro
	jal	memset
	li	$6,64			# 0x00000040
	.set	macro
	.set	reorder


	.loc	1 45
LM41:
	addu	$2,$sp,16
	addu	$3,$sp,80
$L33:
	lw	$7,0($2)
	lw	$8,4($2)
	lw	$9,8($2)
	lw	$10,12($2)
	sw	$7,0($16)
	sw	$8,4($16)
	sw	$9,8($16)
	sw	$10,12($16)
	addu	$2,$2,16
	.set	noreorder
	.set	nomacro
	bne	$2,$3,$L33
	addu	$16,$16,16
	.set	macro
	.set	reorder


	.loc	1 46
LM42:
$Le5:
	.bend	$Le5	4
	lw	$31,84($sp)
	lw	$16,80($sp)
	#nop
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$sp,$sp,88
	.set	macro
	.set	reorder


	.loc	1 46
LM43:
	.end	clear_block
