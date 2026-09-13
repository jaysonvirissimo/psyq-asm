# VERIFY-17, -G 0: Is a load inside .set noreorder checked for a delay?
	.set	noreorder
	lw	$2,0($4)
	addu	$3,$2,$2
