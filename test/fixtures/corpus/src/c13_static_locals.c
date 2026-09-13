/* SPDX-License-Identifier: MIT */
/* Static data and functions: file-scope statics, static locals, and string
   tables. */

static int calls;
static char buffer[128];
static const char *const names[] = { "zero", "one", "two", "three" };
static short table[] = { 1, 1, 2, 3, 5, 8, 13, 21 };

static int helper_twice(int x) { return x * 2; }

const char *name_of(int i)
{
    calls++;
    return names[(unsigned)i < 4 ? i : 0];
}

int next_id(void)
{
    static int id = 100;
    static short step;
    step += 2;
    return id += step;
}

char *scratch(int n)
{
    buffer[n & 127] = 'x';
    return buffer;
}

int fib_table(int i) { return table[i & 7] + helper_twice(calls); }

int literal_length(void)
{
    const char *s = "a literal string";
    int n = 0;
    while (*s++)
        n++;
    return n;
}
