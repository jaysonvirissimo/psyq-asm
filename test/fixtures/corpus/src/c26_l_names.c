/* SPDX-License-Identifier: MIT */
/* Functions, statics, and externs whose names start with L: ordinary symbols,
   not debugging labels. */

extern int LookupExternal(int key);
extern int LevelCount;

static short LevelTable[] = { 3, 1, 4, 1, 5 };

static int Lerp(int a, int b, int t) { return a + (((b - a) * t) >> 8); }

int LoadLevel(int index) { return LookupExternal(LevelTable[index & 3]) + LevelCount; }

int Lighten(int value) { return Lerp(value, 255, 64); }

int LastLevel(void) { return LevelTable[4] + Lighten(LevelCount); }
