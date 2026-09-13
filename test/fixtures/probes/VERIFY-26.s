# VERIFY-26, -G 0: What counts toward the GTE command gap, and what does not end it?
	.ent	first
first:
	lwc2	$0,0($4)
	la	$2,sym
	cop2	0x00486012
	addu	$2,$3,$3
	addu	$2,$3,$3
	lwc2	$0,0($4)
	jal	helper
	cop2	0x00486012
	addu	$2,$3,$3
	addu	$2,$3,$3
	lw	$5,0($4)
	mtc2	$5,$9
	cop2	0x00486012
	addu	$2,$3,$3
	addu	$2,$3,$3
	mtc2	$5,$9
	nop
	lwc2	$0,0($4)
	cop2	0x00486012
	cop2	0x00000001
	mflo	$2
	lwc2	$0,0($4)
	mult	$5,$6
	cop2	0x00486012
	addu	$2,$3,$3
	addu	$2,$3,$3
	lwc2	$0,0($4)
	.set	noreorder
	cop2	0x00486012
	nop
	.set	reorder
	addu	$2,$3,$3
	addu	$2,$3,$3
	lwc2	$0,0($4)
	.end	first
	.ent	second
second:
	.data
	.word	1
	.text
	.align	2
	cop2	0x00486012
	jr	$31
	.end	second
