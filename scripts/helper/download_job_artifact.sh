#!/bin/bash
set -e

SCRIPT_DIR=$(dirname "$0")

# Default values
REPOSITORY=admin@x56.theoinf.tu-ilmenau.de:/data/www/x56/ci-cache
DRY_RUN=false
QUIET=false

# Read the commands
while [[ $# -gt 0 ]]; do
  key="$1"

  case $key in
    -r|--repository)
      REPOSITORY="$2"
      shift # past argument
      shift # past value
      ;;

    --directory)
      DIR="$2"
      shift # past argument
      shift # past value
      ;;

    --hash)
      HASH="$2"
      shift # past argument
      shift # past value
      ;;
    
    -n|--dry-run)
      DRY_RUN=true
      shift # past argument
      ;;

    -q|--quiet)
      QUIET=true
      shift # past argument
      ;;

    *) # unknown option
      shift # past argument
    ;;
  esac
done

if [ -z "$DIR" ]; then
  $QUIET || echo "No directory given"
  exit 1
fi

if [ -z "$HASH" ]; then
  $QUIET || echo "No hash given"
  exit 1
fi

SERVER=${REPOSITORY/:*/}
RPATH=${REPOSITORY/*:/}

additional_rsync_args=""
if [ "$DRY_RUN" = true ]; then
  $QUIET || echo "Dry run: not uploading anything"
fi

$QUIET || echo "Repository: $REPOSITORY"

# check if $RPATH/jobs/$file/$hash exists
if ssh -o StrictHostKeyChecking=no $SERVER "sudo test -e $RPATH/jobs/$DIR/$HASH"; then
  $QUIET || echo "Found $RPATH/jobs/$DIR/$HASH. Downloading..."
  mkdir -p $DIR
  rsync -e "ssh -o StrictHostKeyChecking=no" --rsync-path 'sudo rsync' -a $additional_rsync_args $REPOSITORY/jobs/$DIR/$HASH/ $DIR
  exit 0
fi

exit 1