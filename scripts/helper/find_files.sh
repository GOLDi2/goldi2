#!/bin/bash
set -e

SCRIPT_DIR=$(dirname "$0")

find -L $SCRIPT_DIR/../.. -path "$1" -o \( -name 'build' -o -name 'node_modules' -o -path './crosslab' -o -path './badges' -o -name '\.tox' \) -prune -false
