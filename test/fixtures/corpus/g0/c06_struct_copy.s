	.file	1 "c06_struct_copy.c"
gcc2_compiled.:
__gnu_compiled_c:
	.text
	.align	2
	.globl	make_pair
	.ent	make_pair
make_pair:
	.frame	$sp,8,$31		# vars= 8, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	subu	$sp,$sp,8
	move	$2,$4
	sw	$5,0($sp)
	sw	$6,4($sp)
	lw	$3,0($sp)
	lw	$7,4($sp)
	sw	$3,0($2)
	sw	$7,4($2)
	.set	noreorder
	.set	nomacro
	j	$31
	addu	$sp,$sp,8
	.set	macro
	.set	reorder

	.end	make_pair
	.align	2
	.globl	copy_record
	.ent	copy_record
copy_record:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
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
	.end	copy_record
	.align	2
	.globl	reset_record
	.ent	reset_record
reset_record:
	.frame	$sp,32,$31		# vars= 8, regs= 2/0, args= 16, extra= 0
	.mask	0x80010000,-4
	.fmask	0x00000000,0
	subu	$sp,$sp,32
	sw	$16,24($sp)
	move	$16,$4
	addu	$4,$sp,16
	sw	$5,36($sp)
	li	$5,-1			# 0xffffffff
	sw	$6,40($sp)
	li	$6,1			# 0x00000001
	sw	$31,28($sp)
	sw	$7,44($sp)
	.set	noreorder
	.set	nomacro
	jal	make_pair
	sh	$0,36($sp)
	.set	macro
	.set	reorder

	move	$3,$16
	addu	$2,$sp,36
	addu	$4,$sp,84
	lw	$8,16($sp)
	lw	$9,20($sp)
	sw	$8,76($sp)
	sw	$9,80($sp)
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

	.end	reset_record
	.align	2
	.globl	sum_pairs
	.ent	sum_pairs
sum_pairs:
	.frame	$sp,0,$31		# vars= 0, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	move	$6,$0
	.set	noreorder
	.set	nomacro
	blez	$5,$L8
	move	$7,$6
	.set	macro
	.set	reorder

$L10:
	lw	$2,0($4)
	lw	$3,4($4)
	addu	$6,$6,1
	subu	$2,$2,$3
	addu	$7,$7,$2
	slt	$2,$6,$5
	.set	noreorder
	.set	nomacro
	bne	$2,$0,$L10
	addu	$4,$4,8
	.set	macro
	.set	reorder

$L8:
	.set	noreorder
	.set	nomacro
	j	$31
	move	$2,$7
	.set	macro
	.set	reorder

	.end	sum_pairs
	.align	2
	.globl	swap_records
	.ent	swap_records
swap_records:
	.frame	$sp,48,$31		# vars= 48, regs= 0/0, args= 0, extra= 0
	.mask	0x00000000,0
	.fmask	0x00000000,0
	subu	$sp,$sp,48
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

	.set	noreorder
	.set	nomacro
	j	$31
	addu	$sp,$sp,48
	.set	macro
	.set	reorder

	.end	swap_records

	.text
