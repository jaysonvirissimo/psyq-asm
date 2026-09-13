/* SPDX-License-Identifier: MIT */
/* Signed and unsigned bitfields of assorted widths. */

struct Flags {
    unsigned visible : 1;
    unsigned layer : 3;
    signed depth : 5;
    unsigned color : 7;
    unsigned wide : 16;
};

int is_visible(struct Flags *f) { return f->visible; }
void set_layer(struct Flags *f, int layer) { f->layer = layer; }
int get_depth(struct Flags *f) { return f->depth; }

void pack(struct Flags *f, int color, int wide)
{
    f->color = color;
    f->wide = wide;
    f->depth = -3;
}

unsigned int combine(struct Flags *f) { return (f->layer << 8) | f->color; }
