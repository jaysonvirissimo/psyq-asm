/* SPDX-License-Identifier: MIT */
/* Globals of every size class: small and large commons, initialized data,
   and externs, read, written, and addressed. */

int counter;
short small_short = 7;
char small_char;
int big_array[64];
struct Vec { int x, y, z; } origin = { 1, 2, 3 };
double pi_value = 3.25;
extern int shared_total;
extern char shared_table[256];

int bump(void)
{
    counter++;
    small_char = (char)counter;
    return counter + small_short;
}

int total(void) { return shared_total + shared_table[3] + big_array[counter & 63]; }
int *address_of(int which) { return which ? &counter : &big_array[10]; }
int dot_origin(struct Vec *v) { return v->x * origin.x + v->y * origin.y + v->z * origin.z; }
double pi_twice(void) { return pi_value * 2; }

void store_all(int value)
{
    counter = value;
    shared_total = value;
    big_array[5] = value;
    origin.y = value;
}
