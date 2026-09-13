/* SPDX-License-Identifier: MIT */
/* Initialized data: strings, pointer tables, byte and short arrays, and
   pointers to external data. */

const char greeting[] = "hello, corpus";
char *messages[3] = { "first", "second", 0 };
unsigned char palette[16] = { 0, 17, 34, 51, 68, 85, 102, 119, 136, 153, 170, 187, 204, 221, 238, 255 };
short lookup[4] = { -1, 0x7fff, -32768, 12 };
int *pointer_table[2] = { 0, 0 };
extern int external_value;
int *points_outside = &external_value;
int offsets[3] = { sizeof(greeting), 4, 8 };

const char *message(int i) { return messages[(unsigned)i < 3 ? i : 2]; }

int palette_sum(void)
{
    int i, s = 0;
    for (i = 0; i < 16; i++)
        s += palette[i];
    return s + lookup[1];
}

char greeting_char(int i) { return greeting[i & 7]; }
