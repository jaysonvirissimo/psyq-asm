/* SPDX-License-Identifier: MIT */
/* Function pointers, tables of them, and pointer arithmetic. */

typedef int (*Handler)(int);
struct Entry { const char *name; Handler handler; int weight; };

static int twice(int x) { return x + x; }
static int square(int x) { return x * x; }

struct Entry entries[] = { { "twice", twice, 1 }, { "square", square, 2 } };

int apply(Handler h, int v) { return h(v); }

int run_all(int v)
{
    int i, total = 0;
    for (i = 0; i < 2; i++)
        total += entries[i].handler(v) * entries[i].weight;
    return total;
}

int *advance(int *p, int n) { return p + n; }
int distance(char *a, char *b) { return b - a; }

int walk(int **grid, int rows, int cols)
{
    int r, c, s = 0;
    for (r = 0; r < rows; r++)
        for (c = 0; c < cols; c++)
            s += grid[r][c];
    return s;
}

extern void callback_a(void);
extern void callback_b(void);

void (*select_callback(int which))(void) { return which ? callback_a : callback_b; }
