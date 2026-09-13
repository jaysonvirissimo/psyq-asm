# VERIFY-1, -G 8: Is a small .extern addressed through $gp?
	.extern	g_counter, 4
	.extern	g_large, 16
	.text
	lw	$3,g_counter
	sw	$3,g_counter
	la	$2,g_counter
	lw	$4,g_large
