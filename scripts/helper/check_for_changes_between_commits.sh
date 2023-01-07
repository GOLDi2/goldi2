#!/bin/bash
set -e

SCRIPT_DIR=$(dirname "$0")

# Default values
CHECK=false
WORKTREE=false

# Read the commands

while [[ $# -gt 0 ]]; do
  key="$1"

  case $key in
    -f|--files)
      if [ -z "$PATHS" ]; then
        PATHS="$2"
      else
        PATHS="$PATHS $2"
      fi
      shift # past argument
      shift # past value
      ;;

    -w|--worktree)
      WORKTREE=true
      shift # past argument
      ;;

    -c|--check)
      CHECK=true
      shift # past argument
      ;;

    *) # unknown option OLD_COMMIT then NEW_COMMIT
      if [ -z "$OLD_COMMIT" ]; then
        OLD_COMMIT="$1"
      elif [ -z "$NEW_COMMIT" ]; then
        NEW_COMMIT="$1"
      else
        echo "Unknown option $1"
        exit 1
      fi
      shift # past argument
    ;;
  esac
done

if [ -z "$OLD_COMMIT" ]; then
  OLD_COMMIT="HEAD~1"
fi

if [ -z "$NEW_COMMIT" ]; then
  NEW_COMMIT="HEAD"
  WORKTREE=true
fi

cd $SCRIPT_DIR/../..

ALL_CHANGES=$($SCRIPT_DIR/recursive_git_diff.sh "$OLD_COMMIT" "$NEW_COMMIT" 2>/dev/null || true)

if [ "$WORKTREE" = true ]; then
  if [ -z "$ALL_CHANGES" ]; then
    ALL_CHANGES=$(realpath -q $(git status --porcelain | cut -c4-) || true)
  else
    ALL_CHANGES=$ALL_CHANGES$'\n'$(realpath -q $(git status --porcelain | cut -c4-) || true)
  fi
  if [ -z "$ALL_CHANGES" ]; then
    ALL_CHANGES=$(realpath -q $(git submodule foreach -q 'git status --porcelain | cut -c4-') || true)
  else
    ALL_CHANGES=$ALL_CHANGES$'\n'$(realpath -q $(git submodule foreach -q 'git status --porcelain | cut -c4-') || true)
  fi
fi

for path in $PATHS; do
  files=$(fd -L -H . $path)
  for file in $files; do
     if [ -z "$FILES" ]; then
        FILES=$(realpath $file)
      else
        FILES=$FILES$'\n'$(realpath $file)
      fi
  done
done

ALL_CHANGES=$(echo "$ALL_CHANGES" | sort | uniq)
FILES=$(echo "$FILES" | sort | uniq)

CHANGED_FILES=$(echo "$ALL_CHANGES"$'\n'"$FILES" | sort | uniq -d)

if [ -z "$CHANGED_FILES" ]; then
  exit 1
else
  if [ $CHECK = false ]; then
    echo "$CHANGED_FILES"
  fi
  exit 0
fi