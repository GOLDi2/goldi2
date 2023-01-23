#!/bin/bash
set -e

SCRIPT_DIR=$(dirname "$0")

cd $SCRIPT_DIR/../..

# Default values
REPOSITORY=admin@ci.goldi-labs.de:/data/www/ci/goldi
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

hash_files=$($SCRIPT_DIR/find_files.sh '*/dist/*.hash')
hash_files=${hash_files//.\//}
dist_paths=$($SCRIPT_DIR/find_files.sh '*/dist')
dist_paths=${dist_paths//.\//}

ref=$(git rev-parse HEAD)
branch=$(git rev-parse --abbrev-ref HEAD)

SERVER=${REPOSITORY/:*/}
RPATH=${REPOSITORY/*:/}

additional_rsync_args=""
if [ "$DRY_RUN" = true ]; then
  $QUIET || echo "Dry run: not uploading anything"
fi

$QUIET || echo "Repository: $REPOSITORY"
$QUIET || echo "Ref: $ref"

for file in $dist_paths; do
  $QUIET || echo -e "upload $file\n    to $RPATH/$ref/$file"
  if [ "$DRY_RUN" = false ]; then
    ssh -q -o StrictHostKeyChecking=no $SERVER "sudo install -d -m 0755 $RPATH/$ref/$file"
    rsync -e "ssh -o StrictHostKeyChecking=no" --rsync-path 'sudo rsync' -a $file/ $REPOSITORY/$ref/$file/
  fi
done

$QUIET || echo ""

for file in $hash_files; do
  hash=$(cat $file)
  file=$(dirname $file)
  $QUIET || echo -e "create link $RPATH/jobs/$file/$hash\n         to $RPATH/$ref/$file"
  if [ "$DRY_RUN" = false ]; then
    ssh -q -o StrictHostKeyChecking=no $SERVER "sudo mkdir -p $RPATH/jobs/$file && sudo ln -sf $RPATH/$ref/$file $RPATH/jobs/$file/$hash"
  fi
done;

if [ "$branch" != "HEAD" ]; then
  $QUIET || echo -e "create link $RPATH/$branch\n         to $RPATH/$ref"
  if [ "$DRY_RUN" = false ]; then
    ssh -q -o StrictHostKeyChecking=no $SERVER "sudo ln -sf $RPATH/$ref/ $RPATH/$branch"
  fi
fi