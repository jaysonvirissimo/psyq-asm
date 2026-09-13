/* SPDX-License-Identifier: MIT */
/* Sparse switch statements that become compare chains. */

int sparse_lookup(int key)
{
    switch (key) {
    case 3: return 30;
    case 17: return 170;
    case 256: return 2560;
    case 1000: return 1;
    case 4096: return 2;
    case -5: return 50;
    case 65535: return 3;
    case 0x12345: return 4;
    default: return 0;
    }
}

int ranges(unsigned int x)
{
    switch (x >> 4) {
    case 0: return 'a';
    case 2: return 'b';
    case 8: return 'c';
    case 32: return 'd';
    }
    return 'z';
}
