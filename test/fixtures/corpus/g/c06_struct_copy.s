	.file	1 "c06_struct_copy.c"
gcc2_compiled.:
__gnu_compiled_c:
	.text
	.align	2
	.globl	make_pair
	.align	2
	.globl	copy_record
	.align	2
	.globl	reset_record
	.align	2
	.globl	sum_pairs
	.align	2
	.globl	swap_records

	.text
	.def	Pair;	.scl	10;	.type	0x8;	.size	8;	.endef
	.def	first;	.val	0;	.scl	8;	.type	0x4;	.endef
	.def	second;	.val	4;	.scl	8;	.type	0x4;	.endef
	.def	.eos;	.val	8;	.scl	102;	.tag	Pair;	.size	8;	.endef
	.def	Record;	.scl	10;	.type	0x8;	.size	48;	.endef
	.def	id;	.val	0;	.scl	8;	.type	0x3;	.endef
	.def	tag;	.val	2;	.scl	8;	.dim	6;	.size	6;	.type	0x32;	.endef
	.def	values;	.val	8;	.scl	8;	.dim	8;	.size	32;	.type	0x34;	.endef
	.def	range;	.val	40;	.scl	8;	.tag	Pair;	.size	8;	.type	0x8;	.endef
	.def	.eos;	.val	48;	.scl	102;	.tag	Record;	.size	48;	.endef
	.def	make_pair;	.val	make_pair;	.scl	2;	.tag	Pair;	.size	8;	.type	0x28;	.endef
	.text

	.loc	1 8
LM1:

	.loc	1 8
LM2:
	.ent	make_pair
make_pair:
	.frame	$sp,8,$31		# vars= 8, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	a;	.val	5;	.scl	17;	.type	0x4;	.endef
	.def	b;	.val	6;	.scl	17;	.type	0x4;	.endef
$Lb0:
	.begin	$Lb0	1
	.def	p;	.val	-8;	.scl	1;	.tag	Pair;	.size	8;	.type	0x8;	.endef
$Le1:
	.bend	$Le1	1
	subu	$sp,$sp,8
	move	$2,$4

	.loc	1 10
LM3:
	sw	$5,0($sp)

	.loc	1 11
LM4:
	sw	$6,4($sp)

	.loc	1 12
LM5:
	lw	$3,0($sp)
	lw	$7,4($sp)
	sw	$3,0($2)
	sw	$7,4($2)

	.loc	1 13
LM6:
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$sp,$sp,8
	.set	macro
	.set	reorder


	.loc	1 13
LM7:
	.end	make_pair
	.def	copy_record;	.val	copy_record;	.scl	2;	.type	0x21;	.endef
	.text

	.loc	1 15
LM8:

	.loc	1 15
LM9:
	.ent	copy_record
copy_record:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	dst;	.val	4;	.scl	17;	.tag	Record;	.size	48;	.type	0x18;	.endef
	.def	src;	.val	5;	.scl	17;	.tag	Record;	.size	48;	.type	0x18;	.endef
	addu	$2,$5,48
$L3:
	lw	$3,0($5)
	lw	$6,4($5)
	lw	$7,8($5)
	lw	$8,12($5)
	sw	$3,0($4)
	sw	$6,4($4)
	sw	$7,8($4)
	sw	$8,12($4)
	addu	$5,$5,16
	.set	noreorder
	.set	nomacro
	bne	$5,$2,$L3
	addu	$4,$4,16
	.set	macro
	.set	reorder

	j	$31

	.loc	1 15
LM10:
	.end	copy_record
	.def	reset_record;	.val	reset_record;	.scl	2;	.tag	Record;	.size	48;	.type	0x28;	.endef
	.text

	.loc	1 18
LM11:

	.loc	1 18
LM12:
	.ent	reset_record
reset_record:
	.frame	$sp,32,$31		# vars= 8, regs= 2/0, args= 16, extra= 0
	.mask	0x80010000,-4
	.fmask	0x00000000,0
	.def	r;	.val	4;	.scl	9;	.tag	Record;	.size	48;	.type	0x8;	.endef
	subu	$sp,$sp,32
	sw	$16,24($sp)
	move	$16,$4

	.loc	1 20
LM13:
	addu	$4,$sp,16

	.loc	1 18
LM14:
	sw	$5,36($sp)

	.loc	1 20
LM15:
	li	$5,-1			# 0xffffffff

	.loc	1 18
LM16:
	sw	$6,40($sp)

	.loc	1 20
LM17:
	li	$6,1			# 0x00000001

	.loc	1 18
LM18:
	sw	$31,28($sp)
	sw	$7,44($sp)

	.loc	1 20
LM19:
	.set	noreorder
	.set	nomacro
	jal	make_pair
	sh	$0,36($sp)
	.set	macro
	.set	reorder


	.loc	1 21
LM20:
	move	$3,$16
	addu	$2,$sp,36
	addu	$4,$sp,84

	.loc	1 20
LM21:
	lw	$8,16($sp)
	lw	$9,20($sp)
	sw	$8,76($sp)
	sw	$9,80($sp)

	.loc	1 21
LM22:
$L5:
	lw	$8,0($2)
	lw	$9,4($2)
	lw	$10,8($2)
	lw	$11,12($2)
	sw	$8,0($3)
	sw	$9,4($3)
	sw	$10,8($3)
	sw	$11,12($3)
	addu	$2,$2,16
	.set	noreorder
	.set	nomacro
	bne	$2,$4,$L5
	addu	$3,$3,16
	.set	macro
	.set	reorder


	.loc	1 22
LM23:
	move	$2,$16
	lw	$31,28($sp)
	lw	$16,24($sp)
	#nop
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$sp,$sp,32
	.set	macro
	.set	reorder


	.loc	1 22
LM24:
	.end	reset_record
	.def	sum_pairs;	.val	sum_pairs;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 25
LM25:

	.loc	1 25
LM26:
	.ent	sum_pairs
sum_pairs:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	pairs;	.val	4;	.scl	17;	.tag	Pair;	.size	8;	.type	0x18;	.endef
	.def	count;	.val	5;	.scl	17;	.type	0x4;	.endef

	.loc	1 26
LM27:
$Lb2:
	.begin	$Lb2	2
	.def	i;	.val	6;	.scl	4;	.type	0x4;	.endef
	.def	s;	.val	7;	.scl	4;	.type	0x4;	.endef

	.loc	1 27
LM28:
	move	$6,$0
	.set	noreorder
	.set	nomacro
	blez	$5,$L8
	move	$7,$6
	.set	macro
	.set	reorder

$L10:

	.loc	1 28
LM29:
	lw	$2,0($4)
	lw	$3,4($4)

	.loc	1 27
LM30:
	addu	$6,$6,1

	.loc	1 28
LM31:
	subu	$2,$2,$3
	addu	$7,$7,$2

	.loc	1 27
LM32:
	slt	$2,$6,$5
	.set	noreorder
	.set	nomacro
	bne	$2,$0,$L10
	addu	$4,$4,8
	.set	macro
	.set	reorder

$L8:

	.loc	1 29
LM33:
$Le3:
	.bend	$Le3	5

	.loc	1 30
LM34:
	.set	noreorder
	.set	nomacro
	j	$31
	move	$2,$7
	.set	macro
	.set	reorder


	.loc	1 30
LM35:
	.end	sum_pairs
	.def	swap_records;	.val	swap_records;	.scl	2;	.type	0x21;	.endef
	.text

	.loc	1 33
LM36:

	.loc	1 33
LM37:
	.ent	swap_records
swap_records:
	.frame	$sp,48,$31		# vars= 48, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	a;	.val	4;	.scl	17;	.tag	Record;	.size	48;	.type	0x18;	.endef
	.def	b;	.val	5;	.scl	17;	.tag	Record;	.size	48;	.type	0x18;	.endef
$Lb4:
	.begin	$Lb4	1
	.def	t;	.val	-48;	.scl	1;	.tag	Record;	.size	48;	.type	0x8;	.endef
	subu	$sp,$sp,48

	.loc	1 34
LM38:
	move	$3,$sp
	move	$2,$4
	addu	$6,$4,48
$L13:
	lw	$7,0($2)
	lw	$8,4($2)
	lw	$9,8($2)
	lw	$10,12($2)
	sw	$7,0($3)
	sw	$8,4($3)
	sw	$9,8($3)
	sw	$10,12($3)
	addu	$2,$2,16
	.set	noreorder
	.set	nomacro
	bne	$2,$6,$L13
	addu	$3,$3,16
	.set	macro
	.set	reorder


	.loc	1 35
LM39:
	move	$2,$5
	addu	$3,$5,48
$L14:
	lw	$7,0($2)
	lw	$8,4($2)
	lw	$9,8($2)
	lw	$10,12($2)
	sw	$7,0($4)
	sw	$8,4($4)
	sw	$9,8($4)
	sw	$10,12($4)
	addu	$2,$2,16
	.set	noreorder
	.set	nomacro
	bne	$2,$3,$L14
	addu	$4,$4,16
	.set	macro
	.set	reorder


	.loc	1 36
LM40:
	move	$2,$sp
	addu	$3,$sp,48
$L15:
	lw	$7,0($2)
	lw	$8,4($2)
	lw	$9,8($2)
	lw	$10,12($2)
	sw	$7,0($5)
	sw	$8,4($5)
	sw	$9,8($5)
	sw	$10,12($5)
	addu	$2,$2,16
	.set	noreorder
	.set	nomacro
	bne	$2,$3,$L15
	addu	$5,$5,16
	.set	macro
	.set	reorder


	.loc	1 37
LM41:
$Le5:
	.bend	$Le5	5
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$sp,$sp,48
	.set	macro
	.set	reorder


	.loc	1 37
LM42:
	.end	swap_records
