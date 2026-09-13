// SPDX-License-Identifier: MIT
/**
 * The public type surface. Type-only: no runtime code lives here, which is why
 * the module is excluded from coverage (see CONTRIBUTING.md).
 */

/** ASPSX versions this package emulates. */
export type AspsxVersion = '2.81';

/** Discriminant of every error thrown by psyq-asm. */
export type ErrorCode = 'invalid-options' | 'invalid-instruction';
