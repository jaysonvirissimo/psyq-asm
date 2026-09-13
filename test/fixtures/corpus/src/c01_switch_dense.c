/* SPDX-License-Identifier: MIT */
/* Dense switch statements that become jump tables, with shared cases,
   fallthrough, and defaults. Original code for psyq-asm's corpus. */

int classify_digit(int c)
{
    switch (c) {
    case '0': case '2': case '4': case '6': case '8':
        return 0;
    case '1': case '3': case '5': case '7': case '9':
        return 1;
    default:
        return -1;
    }
}

int opcode_length(unsigned char op)
{
    switch (op) {
    case 0: return 1;
    case 1: return 2;
    case 2: return 2;
    case 3: return 3;
    case 4: return 1;
    case 5: return 4;
    case 6: return 2;
    case 7: return 3;
    case 8: return 1;
    case 9: return 5;
    case 10: return 2;
    case 11: return 2;
    default: return 0;
    }
}

int step_machine(int state, int input)
{
    switch (state) {
    case 0:
        if (input > 10)
            return 3;
        /* fall through */
    case 1:
        return input & 1 ? 2 : 1;
    case 2:
        state += input;
        break;
    case 3:
        state -= input;
        break;
    case 4:
        state = input * 3;
        break;
    case 5:
        return -state;
    default:
        state = 0;
    }
    return state;
}
