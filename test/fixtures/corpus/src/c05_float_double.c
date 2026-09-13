/* SPDX-License-Identifier: MIT */
/* Software floating point: arithmetic, conversions, comparisons, constants. */

float scale(float x, float k) { return x * k + 0.5f; }
double blend(double a, double b, double t) { return a + (b - a) * t; }
int to_fixed(double value) { return (int)(value * 4096.0); }
double from_fixed(int fixed) { return fixed / 4096.0; }

float clamp_unit(float x)
{
    if (x < 0.0f)
        return 0.0f;
    if (x > 1.0f)
        return 1.0f;
    return x;
}

double constants(int which)
{
    switch (which) {
    case 0: return 3.14159265358979;
    case 1: return -2.5e-3;
    case 2: return 1.0e10;
    default: return 0.0;
    }
}

int float_equal(float a, float b) { return a == b; }
unsigned int round_positive(double x) { return (unsigned int)(x + 0.5); }
