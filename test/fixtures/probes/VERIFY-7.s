# VERIFY-7, -G 0: Field values of HI16, MIPS26, and WORD32 relocations against symbols.
	.set	noreorder
	lui	$2,%hi(sym+0x12345)
	addiu	$2,$2,%lo(sym+0x12345)
	jal	sym+8
	nop
	.data
	.word	sym+4
