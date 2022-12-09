#!/bin/bash
set -e

function docker_or_host_exec(){
  GIT_ROOT=$(git rev-parse --show-toplevel)
  RELATIVE_PATH=$(realpath --relative-to=$GIT_ROOT $(pwd))
  if [ "$HOST" = true ] ; then
    bash -c "$1"
  else
    # Allow docker to create subfolders (build)
    chmod 777 .
    docker run -it -v $GIT_ROOT:/git ghcr.io/siemens/kas/kas bash -c "cd /git/$RELATIVE_PATH && $1"
  fi
}

# Default values
CLEAN=false
VARIANT="kas"
WORLD=false
HOST=false

# Read the commands
while [[ $# -gt 0 ]]; do
  key="$1"

  case $key in
    -c|--clean)
      CLEAN=true
      shift # past argument
      ;;  

    -v|--variant)
      VARIANT="$2"
      shift # past argument
      shift # past value
      ;;

    -w|--world)
      WORLD=true
      shift # past argument
      ;;

    --run_on_host)
      HOST=true
      shift # past argument
      ;;

    *) # unknown option
      shift # past argument
    ;;
  esac
done

if [ "$CLEAN" = true ] ; then
  set +e
  rm -rf ./dist
  docker_or_host_exec "rm -rf ./build"
  set -e
fi

if [ "$WORLD" = true ] ; then
  docker_or_host_exec "kas shell $VARIANT.yml -c \"bitbake -k -c build world\""
else
  docker_or_host_exec "kas shell $VARIANT.yml -c \"bitbake -c build goldi-dev-image goldi-dev-update-bundle goldi-image goldi-update-bundle\""
fi

mkdir -p ./dist
cp $(ls ./build/tmp/deploy/images/*/goldi-dev-update-bundle*.*raucb | sort | head -n1) ./dist/goldi-dev-update-bundle.raucb
cp $(ls ./build/tmp/deploy/images/*/goldi-update-bundle*.*raucb | sort | head -n1) ./dist/goldi-update-bundle.raucb
cp $(ls ./build/tmp/deploy/images/*/goldi-dev-image*.*wic.bz2 | sort | head -n1) ./dist/goldi-dev-image.wic.bz2
cp $(ls ./build/tmp/deploy/images/*/goldi-dev-image*.*wic.bmap | sort | head -n1) ./dist/goldi-dev-image.wic.bmap 
cp $(ls ./build/tmp/deploy/images/*/goldi-image*.*wic.bmap | sort | head -n1) ./dist/goldi-image.wic.bz2
cp $(ls ./build/tmp/deploy/images/*/goldi-image*.*wic.bz2 | sort | head -n1) ./dist/goldi-image.wic.bmap 