#!/bin/bash
set -e

SCRIPT_DIR=$(dirname "$0")

# default values
NO_EXPORT=false

# Read the commands
while [[ $# -gt 0 ]]; do
  key="$1"

  case $key in
    -t|--tag)
      if [ -z "$ADDITIONAL_TAGS" ]; then
        ADDITIONAL_TAGS="$2"
      else
        ADDITIONAL_TAGS="$ADDITIONAL_TAGS $2"
      fi
      shift # past argument
      shift # past value
      ;;

    --no-export)
      NO_EXPORT=true
      shift # past argument
      ;;

    *) # unknown option
      shift # past argument
    ;;
  esac
done

# load the crosslab development container
docker load < ../crosslab-development-container/dist/crosslab-devcontainer.tar

# Build the container
docker build -t goldi-devcontainer:build .
if [ -n "$ADDITIONAL_TAGS" ]; then
  for tag in $ADDITIONAL_TAGS; do
    docker tag goldi-devcontainer:build  $tag
  done
fi

# Save the container to a tar file
if [ "$NO_EXPORT" = false ]; then
  mkdir -p dist
  docker save goldi-devcontainer:build  > dist/goldi-devcontainer.tar
fi