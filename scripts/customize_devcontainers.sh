#!/bin/bash
set -e

SCRIPT_DIR=$(dirname "$0")

# Default values
CLEAN=false

# Read the commands
while [[ $# -gt 0 ]]; do
  key="$1"

  case $key in
    -c|--clean)
      CLEAN=true
      shift # past argument
      ;;

    *) # unknown option
      shift # past argument
    ;;
  esac
done
config_paths=$($SCRIPT_DIR/.find-files.sh '*/.devcontainer/devcontainer.json')

_pwd=$PWD
if [ "$CLEAN" = true ] ; then
    for config_path in $config_paths; do
        dir=$(dirname $(dirname $config_path))
        cd $_pwd
        cd $dir
        if [ -f .devcontainer/devcontainer.json.bak ]; then
            echo "Restoring .devcontainer/devcontainer.json.bak"
            mv .devcontainer/devcontainer.json.bak .devcontainer/devcontainer.json
        fi
    done
    exit 0
fi
for config_path in $config_paths; do
    dir=$(dirname $(dirname $config_path))
    cd $_pwd
    cd $dir
        
    # if .devcontainer/devcontainer.json doesnt exists, exit
    if [ ! -f .devcontainer/devcontainer.json ]; then
        echo "No .devcontainer/devcontainer.json found. Exiting."
        exit 0
    fi

    # if .devcontainer/devcontainer.json.bak doesnt exists, create it
    if [ ! -f .devcontainer/devcontainer.json.bak ]; then
        echo "Creating .devcontainer/devcontainer.json.bak"
        cp .devcontainer/devcontainer.json .devcontainer/devcontainer.json.bak
    else
        cp .devcontainer/devcontainer.json.bak .devcontainer/devcontainer.json
    fi
    #remove lines containing // from .devcontainer/devcontainer.json
    sed -i '/\/\//d' .devcontainer/devcontainer.json

    git_root=$(git rev-parse --show-superproject-working-tree)
    if [ -z "$git_root" ]; then
        git_root=$(git rev-parse --show-toplevel)
    fi
    workspace=$(realpath $PWD --relative-to=$git_root)
    jq '.workspaceMount |= "source='"${git_root}"',target=/workspace,type=bind,consistency=cached"' .devcontainer/devcontainer.json > .devcontainer/devcontainer.json.tmp && mv .devcontainer/devcontainer.json.tmp .devcontainer/devcontainer.json
    jq '.workspaceFolder |= "/workspace/'"${workspace}"'"' .devcontainer/devcontainer.json > .devcontainer/devcontainer.json.tmp && mv .devcontainer/devcontainer.json.tmp .devcontainer/devcontainer.json
done
