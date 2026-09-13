# VERIFY-5, -G 8: Alignment and order of .comm/.lcomm allocations.
	.comm	a,1
	.comm	b,4
	.lcomm	c,2
	.comm	d,8
	.comm	e,100
	.text
	la	$2,a
	la	$2,b
	la	$2,c
	la	$2,d
	la	$2,e
