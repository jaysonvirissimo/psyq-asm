/* SPDX-License-Identifier: MIT */
/* Arguments beyond the four register slots, mixed types, and structures by
   value. */

extern int sink(int a, int b, int c, int d, int e, int f, int g, int h);

int pass_through(int a, int b, int c, int d, int e, int f) { return sink(f, e, d, c, b, a, a + f, b + e); }
int stack_args(int a, int b, int c, int d, int e, int f, int g) { return a - b + c - d + e - f + g; }
double mixed_args(int a, double b, int c, float d) { return a * b + c * d; }

struct Big { int values[10]; };

int pass_struct(struct Big big, int extra) { return big.values[0] + big.values[9] + extra; }

struct Big return_struct(int seed)
{
    struct Big b;
    int i;
    for (i = 0; i < 10; i++)
        b.values[i] = seed + i;
    return b;
}
