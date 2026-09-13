# Security policy

## Supported versions

Only the latest published release receives security fixes. Patches are issued
against the current minor; there are no long-term-support branches.

## Reporting a vulnerability

Please do not open a public issue for a security problem. Use GitHub's private
vulnerability reporting on this repository ("Report a vulnerability" under the
Security tab), which reaches the maintainer directly.

Include the package version, the browser or Node.js version, and a minimal
input that reproduces the problem.

## What to expect

- Acknowledgement within 7 days.
- An assessment and, where warranted, a fix or mitigation within 90 days of the
  report, with credit to the reporter unless they prefer otherwise.
- Coordinated disclosure: the advisory is published together with the fixed
  release.

## Threat model in brief

The library is a set of pure functions over untrusted text and integers. It
performs no I/O, opens no network connections, evaluates no code, and keeps no
state between calls. Malformed input produces diagnostics in a failed result
rather than an exception. Work is linear in the size of the input; callers that
accept input from untrusted parties should still bound its size, as they would
for any parser.

The command-line tool reads only the files named on its command line and
writes only the output file it is given.

The library sends no telemetry of any kind.
