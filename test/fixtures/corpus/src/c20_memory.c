/* SPDX-License-Identifier: MIT */
/* Byte, word, and string routines, and block clears. */

void copy_bytes(char *dst, const char *src, int n)
{
    while (n-- > 0)
        *dst++ = *src++;
}

void zero_words(int *p, int n)
{
    int i;
    for (i = 0; i < n; i++)
        p[i] = 0;
}

int compare_strings(const char *a, const char *b)
{
    while (*a && *a == *b) {
        a++;
        b++;
    }
    return (unsigned char)*a - (unsigned char)*b;
}

int string_length(const char *s)
{
    const char *p = s;
    while (*p)
        p++;
    return p - s;
}

void fill_pattern(unsigned short *p, int n, unsigned short value)
{
    while (n--)
        *p++ = value ^ (unsigned short)n;
}

struct Block { int header; char payload[60]; };

void clear_block(struct Block *b)
{
    struct Block empty = { 0 };
    *b = empty;
}
