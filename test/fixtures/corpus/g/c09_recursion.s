	.file	1 "c09_recursion.c"
gcc2_compiled.:
__gnu_compiled_c:
	.text
	.align	2
	.globl	fib
	.align	2
	.globl	ackermann
	.align	2
	.globl	tree_sum
	.align	2
	.align	2
	.globl	lcm

	.text
	.def	Node;	.scl	10;	.type	0x8;	.size	12;	.endef
	.def	left;	.val	0;	.scl	8;	.tag	Node;	.size	12;	.type	0x18;	.endef
	.def	right;	.val	4;	.scl	8;	.tag	Node;	.size	12;	.type	0x18;	.endef
	.def	value;	.val	8;	.scl	8;	.type	0x4;	.endef
	.def	.eos;	.val	12;	.scl	102;	.tag	Node;	.size	12;	.endef
	.def	fib;	.val	fib;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 6
LM1:

	.loc	1 6
LM2:
	.ent	fib
fib:
	.frame	$sp,24,$31		# vars= 0, regs= 2/0, args= 16, extra= 0
	.mask	0x80010000,-4
	.fmask	0x00000000,0
	.def	n;	.val	16;	.scl	17;	.type	0x4;	.endef
	subu	$sp,$sp,24
	sw	$16,16($sp)
	move	$16,$4
	slt	$2,$16,2
	.set	noreorder
	.set	nomacro
	bne	$2,$0,$L2
	sw	$31,20($sp)
	.set	macro
	.set	reorder

	.set	noreorder
	.set	nomacro
	jal	fib
	addu	$4,$16,-1
	.set	macro
	.set	reorder

	addu	$4,$16,-2
	.set	noreorder
	.set	nomacro
	jal	fib
	move	$16,$2
	.set	macro
	.set	reorder

	.set	noreorder
	.set	nomacro
	j	$L3
	addu	$2,$16,$2
	.set	macro
	.set	reorder

$L2:
	move	$2,$16
$L3:
	lw	$31,20($sp)
	lw	$16,16($sp)
	#nop
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$sp,$sp,24
	.set	macro
	.set	reorder


	.loc	1 6
LM3:
	.end	fib
	.def	ackermann;	.val	ackermann;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 9
LM4:

	.loc	1 9
LM5:
	.ent	ackermann
ackermann:
	.frame	$sp,24,$31		# vars= 0, regs= 2/0, args= 16, extra= 0
	.mask	0x80010000,-4
	.fmask	0x00000000,0
	subu	$sp,$sp,24
	move	$2,$5
	sw	$31,20($sp)
	sw	$16,16($sp)
	.def	m;	.val	4;	.scl	17;	.type	0x4;	.endef
	.def	n;	.val	2;	.scl	17;	.type	0x4;	.endef
$L7:

	.loc	1 10
LM6:
	bne	$4,$0,$L5

	.loc	1 11
LM7:
	.set	noreorder
	.set	nomacro
	j	$L8
	addu	$2,$2,1
	.set	macro
	.set	reorder

$L5:

	.loc	1 12
LM8:
	.set	noreorder
	.set	nomacro
	bne	$2,$0,$L6
	addu	$16,$4,-1
	.set	macro
	.set	reorder


	.loc	1 13
LM9:
	addu	$4,$4,-1
	.set	noreorder
	.set	nomacro
	j	$L7
	li	$2,1			# 0x00000001
	.set	macro
	.set	reorder

$L6:

	.loc	1 14
LM10:
	.set	noreorder
	.set	nomacro
	jal	ackermann
	addu	$5,$2,-1
	.set	macro
	.set	reorder

	.set	noreorder
	.set	nomacro
	j	$L7
	move	$4,$16
	.set	macro
	.set	reorder

$L8:
	lw	$31,20($sp)
	lw	$16,16($sp)
	#nop
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$sp,$sp,24
	.set	macro
	.set	reorder


	.loc	1 14
LM11:
	.end	ackermann
	.def	tree_sum;	.val	tree_sum;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 18
LM12:

	.loc	1 18
LM13:
	.ent	tree_sum
tree_sum:
	.frame	$sp,32,$31		# vars= 0, regs= 3/0, args= 16, extra= 0
	.mask	0x80030000,-8
	.fmask	0x00000000,0
	.def	node;	.val	17;	.scl	17;	.tag	Node;	.size	12;	.type	0x18;	.endef
	subu	$sp,$sp,32
	sw	$17,20($sp)
	move	$17,$4
	sw	$31,24($sp)

	.loc	1 19
LM14:
	.set	noreorder
	.set	nomacro
	beq	$17,$0,$L10
	sw	$16,16($sp)
	.set	macro
	.set	reorder


	.loc	1 21
LM15:
	lw	$4,0($17)
	jal	tree_sum
	lw	$4,4($17)
	.set	noreorder
	.set	nomacro
	jal	tree_sum
	move	$16,$2
	.set	macro
	.set	reorder

	lw	$3,8($17)
	#nop
	addu	$3,$3,$16
	.set	noreorder
	.set	nomacro
	j	$L11
	addu	$2,$3,$2
	.set	macro
	.set	reorder

$L10:

	.loc	1 20
LM16:
	move	$2,$0
$L11:
	lw	$31,24($sp)
	lw	$17,20($sp)
	lw	$16,16($sp)
	#nop
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$sp,$sp,32
	.set	macro
	.set	reorder


	.loc	1 21
LM17:
	.end	tree_sum
	.def	gcd_static;	.val	gcd_static;	.scl	3;	.type	0x24;	.endef
	.text

	.loc	1 24
LM18:

	.loc	1 24
LM19:
	.ent	gcd_static
gcd_static:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	a;	.val	4;	.scl	17;	.type	0x4;	.endef
	.def	b;	.val	5;	.scl	17;	.type	0x4;	.endef
$L14:
	beq	$5,$0,$L13
	rem	$2,$4,$5
	move	$4,$5
	.set	noreorder
	.set	nomacro
	j	$L14
	move	$5,$2
	.set	macro
	.set	reorder

$L13:
	.set	noreorder
	.set	nomacro
	j	$31
	move	$2,$4
	.set	macro
	.set	reorder


	.loc	1 24
LM20:
	.end	gcd_static
	.def	lcm;	.val	lcm;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 26
LM21:

	.loc	1 26
LM22:
	.ent	lcm
lcm:
	.frame	$sp,32,$31		# vars= 0, regs= 3/0, args= 16, extra= 0
	.mask	0x80030000,-8
	.fmask	0x00000000,0
	.def	a;	.val	16;	.scl	17;	.type	0x4;	.endef
	.def	b;	.val	17;	.scl	17;	.type	0x4;	.endef
	subu	$sp,$sp,32
	sw	$16,16($sp)
	move	$16,$4
	sw	$17,20($sp)
	sw	$31,24($sp)
	.set	noreorder
	.set	nomacro
	jal	gcd_static
	move	$17,$5
	.set	macro
	.set	reorder

	div	$16,$16,$2
	mult	$16,$17
	lw	$31,24($sp)
	lw	$17,20($sp)
	lw	$16,16($sp)
	mflo	$2
	#nop
	#nop
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$sp,$sp,32
	.set	macro
	.set	reorder


	.loc	1 26
LM23:
	.end	lcm
