/* SPDX-License-Identifier: MIT */
/* Stack frames larger than a 16-bit displacement. */

extern void fill(char *buffer, int size);

int big_buffer(int index)
{
    char buffer[40000];
    fill(buffer, sizeof buffer);
    return buffer[index & 0x7fff] + buffer[39999];
}

int huge_locals(int n)
{
    int table[20000];
    int i;
    for (i = 0; i < 20000; i++)
        table[i] = i * n;
    return table[n & 16383];
}

void medium_frame(int a)
{
    short scratch[1024];
    scratch[a & 1023] = (short)a;
    fill((char *)scratch, sizeof scratch);
}
