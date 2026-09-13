/* SPDX-License-Identifier: MIT */
/* Conditional expressions and boolean logic. */

int min3(int a, int b, int c) { return a < b ? (a < c ? a : c) : (b < c ? b : c); }
int clamp(int x, int lo, int hi) { return x < lo ? lo : x > hi ? hi : x; }
int all_positive(int a, int b, int c) { return a > 0 && b > 0 && c > 0; }
int any_zero(int a, int b) { return !a || !b; }
int sign(int x) { return (x > 0) - (x < 0); }
unsigned int select_u(unsigned int a, unsigned int b, int flag) { return flag ? a : b; }
int abs_diff(int a, int b) { return a > b ? a - b : b - a; }
