# VERIFY-22, -G 0: mflo, then mfhi, then mult: a gap nop?
	mflo	$2
	mfhi	$3
	mult	$5,$6
