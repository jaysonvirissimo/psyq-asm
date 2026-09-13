/* SPDX-License-Identifier: MIT */
/* Recursion through public and static functions. */

struct Node { struct Node *left, *right; int value; };

int fib(int n) { return n < 2 ? n : fib(n - 1) + fib(n - 2); }

int ackermann(int m, int n)
{
    if (m == 0)
        return n + 1;
    if (n == 0)
        return ackermann(m - 1, 1);
    return ackermann(m - 1, ackermann(m, n - 1));
}

int tree_sum(struct Node *node)
{
    if (!node)
        return 0;
    return node->value + tree_sum(node->left) + tree_sum(node->right);
}

static int gcd_static(int a, int b) { return b == 0 ? a : gcd_static(b, a % b); }

int lcm(int a, int b) { return a / gcd_static(a, b) * b; }
