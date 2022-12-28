#!/bin/bash
set -e

find -L . -path "$1" -o \( -name 'build' -o -name 'node_modules' -o -path './crosslab' -o -path './badges' -o -name '\.tox' \) -prune -false
