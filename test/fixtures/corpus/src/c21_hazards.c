/* SPDX-License-Identifier: MIT */
/* Loads just before their readers, and divides just before multiplies. */

struct State { int a, b, c; short s; unsigned char u; };

int load_then_branch(struct State *st)
{
    if (st->a > st->b)
        return st->c;
    return st->s;
}

int load_then_shift(struct State *st) { return (st->a << 3) + (st->u >> 1); }

int mult_after_div(int a, int b, int c)
{
    int q = a / b;
    return q * c * q;
}

int rem_then_mult(unsigned int a, unsigned int b) { return (a % b) * (a / b); }

int chained_loads(int **pp)
{
    int *p = *pp;
    int v = *p;
    return v + p[1];
}

int loop_loads(int *p, int n)
{
    int s = 0;
    while (n--) {
        int v = *p++;
        if (v)
            s += v;
    }
    return s;
}
