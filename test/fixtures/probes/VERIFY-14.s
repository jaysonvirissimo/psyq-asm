# VERIFY-14, -G 0: A load from an out-of-range absolute address.
	lw	$2,0x12345678
	lbu	$3,0x1f801070
