# VERIFY-21, -G 0: Where an L-prefixed label binds when a load-delay nop is inserted.
	lw	$2,0($4)
LM1:
	addu	$3,$2,$2
	.rdata
	.word	LM1
