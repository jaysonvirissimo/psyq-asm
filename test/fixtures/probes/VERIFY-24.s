# VERIFY-24, -G 0: Can .bss hold data, and where does it go?
	.section .bss,"aw",@progbits
	.align	2
zero_word:
	.word	0
mixed:
	.byte	0
	.half	0
	.space	3
	.word	5
	.ascii	"x"
	.bss
plain:
	.word	0
	.lcomm	reserved,4
	.text
	la	$2,zero_word
	la	$3,mixed
	la	$4,plain
	la	$5,reserved
