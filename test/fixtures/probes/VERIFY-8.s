# VERIFY-8, -G 0: Expansions of negu, la with a number, and b.
	.set	noreorder
	negu	$2,$3
	la	$2,0x12345
	b	$L1
	nop
$L1:
	jr	$31
	nop
