/* SPDX-License-Identifier: MIT */
/* Unions, enums, and type punning. */

enum Kind { KIND_NONE, KIND_INT = 4, KIND_FLOAT, KIND_PTR = 100 };
union Value { int i; float f; void *p; unsigned char bytes[4]; };
struct Tagged { enum Kind kind; union Value value; };

int describe(struct Tagged *t)
{
    switch (t->kind) {
    case KIND_INT: return t->value.i;
    case KIND_FLOAT: return (int)t->value.f;
    case KIND_PTR: return t->value.p != 0;
    default: return -1;
    }
}

unsigned int bytes_of(float f)
{
    union Value v;
    v.f = f;
    return v.bytes[0] | (v.bytes[3] << 24);
}

int kind_size(enum Kind k) { return k == KIND_NONE ? 0 : sizeof(union Value); }
