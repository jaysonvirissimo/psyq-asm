/* SPDX-License-Identifier: MIT */
/* 64-bit arithmetic, which cc1psx lowers to register pairs and helper calls. */

long long ll_add(long long a, long long b) { return a + b; }
long long ll_mul(long long a, long long b) { return a * b; }
long long ll_div(long long a, long long b) { return a / b; }
unsigned long long ull_mod(unsigned long long a, unsigned long long b) { return a % b; }
long long ll_shift(long long a, int n) { return (a << n) ^ (a >> (n & 7)); }
int ll_compare(long long a, long long b) { return a < b ? -1 : a > b; }
long long widen(int x) { return (long long)x * 100000; }
