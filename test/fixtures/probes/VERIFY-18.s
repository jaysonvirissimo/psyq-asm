# VERIFY-18, -G 0: A nop after mfc2/cfc2 when the next instruction reads the register?
	mfc2	$4,$8
	addu	$2,$4,$4
	cfc2	$5,$31
	sw	$5,0($6)
