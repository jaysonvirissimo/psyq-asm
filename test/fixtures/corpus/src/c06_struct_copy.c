/* SPDX-License-Identifier: MIT */
/* Structures copied, passed, and returned by value. */

struct Pair { int first, second; };
struct Record { short id; char tag[6]; int values[8]; struct Pair range; };

struct Pair make_pair(int a, int b)
{
    struct Pair p;
    p.first = a;
    p.second = b;
    return p;
}

void copy_record(struct Record *dst, const struct Record *src) { *dst = *src; }

struct Record reset_record(struct Record r)
{
    r.id = 0;
    r.range = make_pair(-1, 1);
    return r;
}

int sum_pairs(struct Pair *pairs, int count)
{
    int i, s = 0;
    for (i = 0; i < count; i++)
        s += pairs[i].first - pairs[i].second;
    return s;
}

void swap_records(struct Record *a, struct Record *b)
{
    struct Record t = *a;
    *a = *b;
    *b = t;
}
