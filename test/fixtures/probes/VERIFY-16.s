# VERIFY-16, -G 0: Stores with out-of-range offsets and addresses.
	sw	$2,40000($4)
	sw	$2,0x12345678
