/* SPDX-License-Identifier: MIT */
/* 32-bit constants, 16-bit edge values, and absolute hardware addresses. */

#define REG_STATUS (*(volatile unsigned int *)0x1F801070)
#define REG_MASK (*(volatile unsigned int *)0x1F801074)
#define GPU_DATA (*(volatile unsigned int *)0x1F801810)

unsigned int ack_interrupts(unsigned int bits)
{
    unsigned int status = REG_STATUS;
    REG_STATUS = ~bits;
    REG_MASK |= bits;
    return status;
}

void gpu_write(unsigned int value) { GPU_DATA = value; }

unsigned int magic(int which)
{
    switch (which & 3) {
    case 0: return 0xDEADBEEF;
    case 1: return 0x8000;
    case 2: return 0xFFFF;
    default: return 0x7FFFFFFF;
    }
}

int negative(void) { return -0x12345; }
unsigned int masks(unsigned int x) { return (x & 0xFF00FF00) | (x & 0x00F0) | 0x8001; }
int in_range(int x) { return x >= -32768 && x < 32768; }
