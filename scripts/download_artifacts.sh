#!/bin/bash
set -e

SCRIPT_DIR=$(dirname "$0")

# Default values
BRANCH=$(git rev-parse --abbrev-ref HEAD)
REPOSITORY=admin@x56.theoinf.tu-ilmenau.de:/data/www/x56/artifacts
JOB=
CLEAN=false

# Read the commands
while [[ $# -gt 0 ]]; do
  key="$1"

  case $key in
    -b|--branch)
      BRANCH="$2"
      shift # past argument
      shift # past value
      ;;

    -r|--repository)
      REPOSITORY="$2"
      shift # past argument
      shift # past value
      ;;

    -j|--job)
      JOB="$2"
      shift # past argument
      shift # past value
      ;;

    -c|--clean)
      CLEAN=true
      shift # past argument
      ;;

    *) # unknown option
      shift # past argument
    ;;
  esac
done

if [ -z "$JOB" ]; then
    echo "No job specified. Exiting."
    exit -1
fi

rsync -e "ssh -o StrictHostKeyChecking=no" --rsync-path 'sudo rsync' -aK --info=progress2 --chmod=755 $REPOSITORY/$BRANCH/$JOB/ .