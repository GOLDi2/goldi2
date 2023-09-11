#!/bin/bash
set -e

while [[ $# -gt 0 ]]; do
  key="$1"

  case $key in
    -h|--host)
      HOST="$2"
      shift # past argument
      shift # past value
      ;;

    *) # unknown option
      shift # past argument
    ;;
  esac
done

if [ -z "$HOST" ]; then
  echo "Host is not set"
  exit 1
fi

devcontainer build --workspace-folder ./ --image-name goldi2/devcontainer
docker save goldi2/devcontainer | ssh -o StrictHostKeyChecking=no "$HOST" "cat - | sudo docker load"