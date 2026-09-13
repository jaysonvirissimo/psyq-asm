# VERIFY-6, -G 0: Field values of relocations against local labels.
	.set	noreorder
	j	$L2
	lui	$2,%hi($L3)
	addiu	$2,$2,%lo($L3)
$L2:
	jr	$31
	nop
	.rdata
	.align	2
$L3:
	.word	$L2
