# VERIFY-15, -G 8: sym($rs) when sym is small data.
	.comm	g,4
	.text
	lw	$2,g($3)
	sw	$2,g+2($3)
