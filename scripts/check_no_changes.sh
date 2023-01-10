#!/bin/bash
SCRIPT_DIR=$(dirname "$0")

if [[ `git status --porcelain` ]]; then
    echo "There are changes in the repository:"
    git status --porcelain
    git submodule foreach git status --porcelain
    exit 1
else
    echo "No changes in the repository."
    exit 0
fi