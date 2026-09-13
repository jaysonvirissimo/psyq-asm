/* SPDX-License-Identifier: MIT */
/* Sign and zero extension, narrowing, and signed and unsigned compares. */

int sign_char(signed char c) { return c; }
unsigned int zero_char(unsigned char c) { return c; }
int sign_short(short s) { return s * 2; }
unsigned int zero_short(unsigned short s) { return s + 1; }

int narrow(int x)
{
    char c = (char)x;
    short s = (short)x;
    return c + s;
}

int compare_unsigned(unsigned int a, unsigned int b) { return (a < b) + (a >= b) * 2; }
int compare_mixed(int a, unsigned int b) { return a < (int)b; }
unsigned char add_bytes(unsigned char a, unsigned char b) { return a + b; }
int load_fields(unsigned char *p) { return p[0] | (p[1] << 8) | ((signed char)p[2] << 16); }
