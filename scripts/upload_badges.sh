#!/bin/bash
set -e

SCRIPT_DIR=$(dirname "$0")

BRANCH=$(git rev-parse --abbrev-ref HEAD)
JOB_STATUS="failed"
REPOSITORY=admin@x56.theoinf.tu-ilmenau.de:/data/www/x56/badges
badges=$($SCRIPT_DIR/.find-files.sh '*/badge_*.svg')
CLEAN=false

# Read the commands
while [[ $# -gt 0 ]]; do
  key="$1"

  case $key in
    -s|--status)
      if [ "$2" = "success" ]; then
        JOB_STATUS="success"
      fi
      shift # past argument
      shift # past value
      ;;

    -b|--branch)
      BRANCH="$2"
      shift # past argument
      shift # past value
      ;;

    -f|--files)
      badges="$2"
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

# remove tailing _success.svg, _failed.svg or .svg
badges=$(echo "$badges" | sed -e 's/_success.svg$//' -e 's/_failed.svg$//' -e 's/.svg$//')


mkdir -p badges
for badge in $badges; do
    name=$(basename $badge)
    cp "${badge}_${JOB_STATUS}.svg" "badges/${name}.svg" || cp "${badge}.svg" "badges/${name}.svg"
done

rsync -e "ssh -o StrictHostKeyChecking=no" --rsync-path 'sudo rsync' -avP --info=progress2 --chmod=755 -L badges/* $REPOSITORY/$BRANCH/