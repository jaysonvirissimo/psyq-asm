/* SPDX-License-Identifier: MIT */
/* Loops of every shape, with break and continue. */

int count_bits(unsigned int x)
{
    int n = 0;
    while (x) {
        n += x & 1;
        x >>= 1;
    }
    return n;
}

int find_first(int *a, int n, int key)
{
    int i;
    for (i = 0; i < n; i++) {
        if (a[i] < 0)
            continue;
        if (a[i] == key)
            break;
    }
    return i;
}

void reverse(char *s, int n)
{
    int i = 0, j = n - 1;
    while (i < j) {
        char t = s[i];
        s[i++] = s[j];
        s[j--] = t;
    }
}

int nested_break(int n)
{
    int i, j, found = -1;
    for (i = 0; i < n && found < 0; i++)
        for (j = 0; j < n; j++)
            if (i * j == n) {
                found = i;
                break;
            }
    return found;
}

unsigned int checksum(unsigned char *p, int n)
{
    unsigned int a = 1, b = 0;
    do {
        a = (a + *p++) % 65521;
        b = (b + a) % 65521;
    } while (--n > 0);
    return (b << 16) | a;
}
