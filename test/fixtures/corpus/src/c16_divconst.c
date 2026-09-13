/* SPDX-License-Identifier: MIT */
/* Division and remainder by constants, powers of two, and negatives. */

int div3(int x) { return x / 3; }
unsigned int udiv10(unsigned int x) { return x / 10; }
int div_pow2(int x) { return x / 16 + x % 8; }
unsigned int umod_pow2(unsigned int x) { return x % 32; }
int mod7(int x) { return x % 7; }
int div_neg(int x) { return x / -4; }
int scale_ratio(int x) { return x * 5 / 9; }
