#!/bin/bash
set -e

# Default values
CLEAN=false
VARIANT="kas"
WORLD=false

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
  kas shell $VARIANT.yml -c "bitbake -k -c build world"
else
  kas shell $VARIANT.yml -c "bitbake -k -c build goldi-dev-image goldi-dev-update-bundle goldi-image goldi-update-bundle"
fi

mkdir -p ./dist
cp $(ls ./build/tmp/deploy/images/*/goldi-dev-update-bundle*.*raucb | sort | head -n1) ./dist/goldi-dev-update-bundle.raucb
cp $(ls ./build/tmp/deploy/images/*/goldi-update-bundle*.*raucb | sort | head -n1) ./dist/goldi-update-bundle.raucb
cp $(ls ./build/tmp/deploy/images/*/goldi-dev-image*.*wic.bz2 | sort | head -n1) ./dist/goldi-dev-image.wic.bz2
cp $(ls ./build/tmp/deploy/images/*/goldi-dev-image*.*wic.bmap | sort | head -n1) ./dist/goldi-dev-image.wic.bmap 
cp $(ls ./build/tmp/deploy/images/*/goldi-image*.*wic.bmap | sort | head -n1) ./dist/goldi-image.wic.bz2
cp $(ls ./build/tmp/deploy/images/*/goldi-image*.*wic.bz2 | sort | head -n1) ./dist/goldi-image.wic.bmap 