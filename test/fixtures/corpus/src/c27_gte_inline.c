/* SPDX-License-Identifier: MIT */
/* Inline GTE register moves and commands written with PsyQ gcc's __asm__
   statements (original macros), so commands follow register writes closely,
   with and without explicit nops. */

#define load_vector(v) __asm__ volatile ("lwc2 $0, 0( %0 );lwc2 $1, 4( %0 );lwc2 $2, 8( %0 )" : : "r"(v))
#define set_depth(d) __asm__ volatile ("mtc2 %0, $30" : : "r"(d))
#define set_control(c) __asm__ volatile ("ctc2 %0, $31" : : "r"(c))
#define run_command() __asm__ volatile ("cop2 0x00486012;")
#define run_command_padded() __asm__ volatile ("nop;nop;cop2 0x01400006;")
#define read_result(r) __asm__ volatile ("mfc2 %0, $9" : "=r"(r))

int transform(long *v)
{
    int result;
    load_vector(v);
    run_command();
    read_result(result);
    return result;
}

int transform_padded(long *v)
{
    int result;
    load_vector(v);
    run_command_padded();
    read_result(result);
    return result;
}

int with_depth(long *v, int depth)
{
    int result;
    set_depth(depth);
    load_vector(v);
    run_command();
    read_result(result);
    return result + depth;
}

int control_then_store(long *v, int c)
{
    int r;
    set_control(c);
    v[3] = c;
    run_command();
    read_result(r);
    return r;
}

int two_vectors(long *a, long *b)
{
    int x, y;
    load_vector(a);
    run_command();
    read_result(x);
    load_vector(b);
    run_command_padded();
    read_result(y);
    return x - y;
}
