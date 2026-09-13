# SPDX-License-Identifier: MIT
#
# wine in an x86-64 Linux container, for running the real ASPSX.EXE with
# `ruby scripts/aspsx-oracle.rb --docker`. The assembler binary is never part
# of the image: the script mounts it read-only at run time.
#
#   docker build --platform linux/amd64 -f scripts/aspsx-wine.Dockerfile -t psyq-asm-aspsx-wine .
FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive \
    WINEDEBUG=-all \
    WINEPREFIX=/opt/wineprefix \
    WINEARCH=win32

RUN dpkg --add-architecture i386 \
 && apt-get update \
 && apt-get install -y --no-install-recommends wine wine32:i386 \
 && rm -rf /var/lib/apt/lists/*

# Create the prefix once, so each assembly does not pay for it.
RUN wineboot --init && wineserver --wait

WORKDIR /work
