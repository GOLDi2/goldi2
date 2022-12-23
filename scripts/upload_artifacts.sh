#!/bin/bash
set -e

SCRIPT_DIR=$(dirname "$0")

# Default values
BRANCH=$(git rev-parse --abbrev-ref HEAD)
REPOSITORY=admin@x56.theoinf.tu-ilmenau.de:/data/www/x56/artifacts
JOB=""
files=$($SCRIPT_DIR/.find-files.sh '*/dist')
CLEAN=false

# Read the commands
while [[ $# -gt 0 ]]; do
  key="$1"

  case $key in
    -r|--repository)
      REPOSITORY="$2"
      shift # past argument
      shift # past value
      ;;

    -b|--branch)
      BRANCH="$2"
      shift # past argument
      shift # past value
      ;;

    -j|--job)
      JOB="$2"
      shift # past argument
      shift # past value
      ;;

    -f|--files)
      files="$2"
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

SERVER=${REPOSITORY/:*/}
RPATH=${REPOSITORY/*:/}

for file in $files; do
    echo "Uploading $file"
    ssh -o StrictHostKeyChecking=no $SERVER "sudo install -d -m 0755 $RPATH/$BRANCH/$JOB/$file"
    rsync -e "ssh -o StrictHostKeyChecking=no" --rsync-path 'sudo rsync' -a --info=progress2 --chmod=755 $file/ $REPOSITORY/$BRANCH/$JOB/$file/
done