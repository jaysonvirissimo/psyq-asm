/* SPDX-License-Identifier: MIT */
/* GNU C labels as values: tables of code addresses and indirect jumps. */

int dispatch(int op, int value)
{
    static void *table[] = { &&add, &&sub, &&neg, &&done };
    goto *table[op & 3];
add:
    value += 1;
    goto done;
sub:
    value -= 1;
    goto done;
neg:
    value = -value;
done:
    return value;
}

int interpreter(unsigned char *code)
{
    static void *ops[] = { &&op_halt, &&op_inc, &&op_dbl };
    int acc = 0;
    goto *ops[*code++ % 3];
op_inc:
    acc++;
    goto *ops[*code++ % 3];
op_dbl:
    acc *= 2;
    goto *ops[*code++ % 3];
op_halt:
    return acc;
}
