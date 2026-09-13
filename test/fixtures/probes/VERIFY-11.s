# VERIFY-11, -G 0: Out-of-range immediate forms of addu, subu, and, or, xor.
	addu	$2,$3,70000
	subu	$2,$3,-32768
	and	$2,$3,-1
	or	$2,$3,70000
	xor	$2,$3,0x10000
