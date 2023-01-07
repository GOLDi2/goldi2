#!/bin/bash
set -e

SCRIPT_DIR=$(dirname "$0")

# Read the commands
while [[ $# -gt 0 ]]; do
  key="$1"

  case $key in
    -p|--path)
      if [ -z "$PATHS" ]; then
        PATHS="$2"
      else
        PATHS="$PATHS $2"
      fi
      shift # past argument
      shift # past value
      ;;
  esac
done

fd -L -H -tf . $PATHS | sort | git hash-object --stdin-paths | git hash-object --stdin