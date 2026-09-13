/* SPDX-License-Identifier: MIT */
/* Multiplies and divides in chains, so mflo/mfhi and the next mult or div sit
   close together. */

int poly(int x, int a, int b, int c)
{
    return a * x * x + b * x + c;
}

int mixed_ops(int a, int b, int c)
{
    int q = a / b;
    int r = a % b;
    int p = q * c;
    return p + r * q;
}

unsigned int unsigned_ops(unsigned int a, unsigned int b)
{
    unsigned int q = a / b;
    unsigned int r = a % b;
    return q * r + (a / (b | 1)) * 3;
}

int matrix_trace(int *m, int n)
{
    int i, j, trace = 0;
    for (i = 0; i < n; i++)
        for (j = 0; j < n; j++)
            if (i == j)
                trace += m[i * n + j] * m[j * n + i];
    return trace;
}

int average(int *values, int count)
{
    int i, sum = 0;
    for (i = 0; i < count; i++)
        sum += values[i];
    return count ? sum / count : 0;
}

long hash_step(long h, long c)
{
    h = h * 31 + c;
    return h % 1000003;
}
