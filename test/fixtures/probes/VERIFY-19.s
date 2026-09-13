# VERIFY-19, -G 0: mflo, then a load, then mult: a gap nop?
	mflo	$2
	lw	$3,0($4)
	mult	$5,$6
