/* SPDX-License-Identifier: MIT */
/* 12-bit fixed-point vector and matrix code of the kind that feeds a
   geometry coprocessor. */

typedef struct { short x, y, z, pad; } SVector;
typedef struct { long vx, vy, vz; } LVector;
typedef struct { short m[3][3]; long t[3]; } Matrix;

void cross(SVector *a, SVector *b, LVector *out)
{
    out->vx = (long)a->y * b->z - (long)a->z * b->y;
    out->vy = (long)a->z * b->x - (long)a->x * b->z;
    out->vz = (long)a->x * b->y - (long)a->y * b->x;
}

long length_squared(LVector *v)
{
    return (v->vx >> 6) * (v->vx >> 6) + (v->vy >> 6) * (v->vy >> 6) + (v->vz >> 6) * (v->vz >> 6);
}

void compose(Matrix *a, Matrix *b, Matrix *out)
{
    int i, j, k;
    for (i = 0; i < 3; i++) {
        for (j = 0; j < 3; j++) {
            long sum = 0;
            for (k = 0; k < 3; k++)
                sum += (long)a->m[i][k] * b->m[k][j];
            out->m[i][j] = (short)(sum >> 12);
        }
        out->t[i] = a->t[i] + b->t[i];
    }
}

int project(SVector *v, int h) { return v->z ? (v->x * h) / v->z : 0; }
