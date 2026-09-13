	.file	1 "c04_longlong.c"
gcc2_compiled.:
__gnu_compiled_c:
	.text
	.align	2
	.globl	ll_add
	.align	2
	.globl	ll_mul
	.align	2
	.globl	ll_div
	.align	2
	.globl	ull_mod
	.align	2
	.globl	ll_shift
	.align	2
	.globl	ll_compare
	.align	2
	.globl	widen

	.text
	.def	ll_add;	.val	ll_add;	.scl	2;	.type	0x25;	.endef
	.text

	.loc	1 4
LM1:

	.loc	1 4
LM2:
	.ent	ll_add
ll_add:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	a;	.val	4;	.scl	17;	.type	0x5;	.endef
	.def	b;	.val	6;	.scl	17;	.type	0x5;	.endef
	addu	$2,$4,$6
	sltu	$8,$2,$6
	addu	$3,$5,$7
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$3,$3,$8
	.set	macro
	.set	reorder


	.loc	1 4
LM3:
	.end	ll_add
	.def	ll_mul;	.val	ll_mul;	.scl	2;	.type	0x25;	.endef
	.text

	.loc	1 5
LM4:

	.loc	1 5
LM5:
	.ent	ll_mul
ll_mul:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	a;	.val	4;	.scl	17;	.type	0x5;	.endef
	.def	b;	.val	6;	.scl	17;	.type	0x5;	.endef
	multu	$4,$6
	mfhi	$3
	mflo	$2
	#nop
	#nop
	mult	$4,$7
	mflo	$9
	#nop
	#nop
	mult	$6,$5
	addu	$3,$3,$9
	mflo	$4
	#nop
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$3,$3,$4
	.set	macro
	.set	reorder


	.loc	1 5
LM6:
	.end	ll_mul
	.def	ll_div;	.val	ll_div;	.scl	2;	.type	0x25;	.endef
	.text

	.loc	1 6
LM7:

	.loc	1 6
LM8:
	.ent	ll_div
ll_div:
	.frame	$sp,24,$31		# vars= 0, regs= 1/0, args= 16, extra= 0
	.mask	0x80000000,-8
	.fmask	0x00000000,0
	.def	a;	.val	4;	.scl	17;	.type	0x5;	.endef
	.def	b;	.val	6;	.scl	17;	.type	0x5;	.endef
	subu	$sp,$sp,24
	sw	$31,16($sp)
	jal	__divdi3
	lw	$31,16($sp)
	#nop
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$sp,$sp,24
	.set	macro
	.set	reorder


	.loc	1 6
LM9:
	.end	ll_div
	.def	ull_mod;	.val	ull_mod;	.scl	2;	.type	0x2f;	.endef
	.text

	.loc	1 7
LM10:

	.loc	1 7
LM11:
	.ent	ull_mod
ull_mod:
	.frame	$sp,24,$31		# vars= 0, regs= 1/0, args= 16, extra= 0
	.mask	0x80000000,-8
	.fmask	0x00000000,0
	.def	a;	.val	4;	.scl	17;	.type	0xf;	.endef
	.def	b;	.val	6;	.scl	17;	.type	0xf;	.endef
	subu	$sp,$sp,24
	sw	$31,16($sp)
	jal	__umoddi3
	lw	$31,16($sp)
	#nop
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$sp,$sp,24
	.set	macro
	.set	reorder


	.loc	1 7
LM12:
	.end	ull_mod
	.def	ll_shift;	.val	ll_shift;	.scl	2;	.type	0x25;	.endef
	.text

	.loc	1 8
LM13:

	.loc	1 8
LM14:
	.ent	ll_shift
ll_shift:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	a;	.val	4;	.scl	17;	.type	0x5;	.endef
	.def	n;	.val	6;	.scl	17;	.type	0x4;	.endef
	sll	$2,$6,26
	bgez	$2,1f
	sll	$9,$4,$6
	.set	noreorder
	b	3f
	move	$8,$0
	.set	reorder

1:
	.set	noreorder
	beq	$2,$0,2f
	sll	$9,$5,$6
	.set	reorder

	subu	$2,$0,$6
	srl	$2,$4,$2
	or	$9,$9,$2
2:
	sll	$8,$4,$6
3:
	andi	$6,$6,0x0007
	sll	$7,$6,26
	bgez	$7,1f
	sra	$2,$5,$6
	.set	noreorder
	b	3f
	sra	$3,$5,31
	.set	reorder

1:
	.set	noreorder
	beq	$7,$0,2f
	srl	$2,$4,$6
	.set	reorder

	subu	$7,$0,$6
	sll	$7,$5,$7
	or	$2,$2,$7
2:
	sra	$3,$5,$6
3:
	xor	$2,$8,$2
	.set	noreorder
	.set	nomacro
	j	$31
	xor	$3,$9,$3
	.set	macro
	.set	reorder


	.loc	1 8
LM15:
	.end	ll_shift
	.def	ll_compare;	.val	ll_compare;	.scl	2;	.type	0x24;	.endef
	.text

	.loc	1 9
LM16:

	.loc	1 9
LM17:
	.ent	ll_compare
ll_compare:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	a;	.val	4;	.scl	17;	.type	0x5;	.endef
	.def	b;	.val	6;	.scl	17;	.type	0x5;	.endef
	slt	$2,$5,$7
	.set	noreorder
	.set	nomacro
	bne	$2,$0,$L12
	li	$3,-1			# 0xffffffff
	.set	macro
	.set	reorder

	.set	noreorder
	.set	nomacro
	bne	$7,$5,$L13
	slt	$2,$7,$5
	.set	macro
	.set	reorder

	sltu	$2,$4,$6
	.set	noreorder
	.set	nomacro
	bne	$2,$0,$L7
	slt	$2,$7,$5
	.set	macro
	.set	reorder

$L13:
	.set	noreorder
	.set	nomacro
	bne	$2,$0,$L11
	move	$3,$0
	.set	macro
	.set	reorder

	.set	noreorder
	.set	nomacro
	bne	$5,$7,$L8
	sltu	$2,$6,$4
	.set	macro
	.set	reorder

	beq	$2,$0,$L12
$L11:
	li	$3,1			# 0x00000001
$L7:
$L8:
$L12:
	.set	noreorder
	.set	nomacro
	j	$31
	move	$2,$3
	.set	macro
	.set	reorder


	.loc	1 9
LM18:
	.end	ll_compare
	.def	widen;	.val	widen;	.scl	2;	.type	0x25;	.endef
	.text

	.loc	1 10
LM19:

	.loc	1 10
LM20:
	.ent	widen
widen:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	.def	x;	.val	4;	.scl	17;	.type	0x4;	.endef
	li	$2,65536			# 0x00010000
	ori	$2,$2,0x86a0
	mult	$4,$2
	mfhi	$3
	mflo	$2
	#nop
	j	$31

	.loc	1 10
LM21:
	.end	widen
