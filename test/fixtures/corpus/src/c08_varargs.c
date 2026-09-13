/* SPDX-License-Identifier: MIT */
/* Variadic functions, with a minimal va_list built on __builtin_next_arg. */

typedef char *va_list;
#define va_start(ap, last) (ap = (va_list)__builtin_next_arg(last))
#define va_arg(ap, type) (ap = (va_list)((char *)(ap) + sizeof(type)), ((type *)(ap))[-1])
#define va_end(ap) ((void)0)

int sum_ints(int count, ...)
{
    va_list ap;
    int total = 0;
    va_start(ap, count);
    while (count-- > 0)
        total += va_arg(ap, int);
    va_end(ap);
    return total;
}

int max_of(int count, ...)
{
    va_list ap;
    int best, v;
    va_start(ap, count);
    best = va_arg(ap, int);
    while (--count > 0) {
        v = va_arg(ap, int);
        if (v > best)
            best = v;
    }
    va_end(ap);
    return best;
}

extern int emit(int code, ...);

int forward(int a, int b) { return emit(1, a, b, a + b) + emit(2); }
