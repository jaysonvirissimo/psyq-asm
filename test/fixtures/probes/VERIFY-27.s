# VERIFY-27, -G 0: Where does a label bind when GTE gap nops go before a command?
	.set	noreorder
	lwc2	$0,0($4)
$L5:
	cop2	0x00486012
	beq	$0,$0,$L5
	nop
	lwc2	$0,0($4)
	sw	$5,0($4)
$L7:
	cop2	0x00486012
	beq	$0,$0,$L7
	nop
	jr	$31
	nop
