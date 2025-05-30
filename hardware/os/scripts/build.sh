#!/bin/bash
set -e

# Default values
CLEAN=false
VARIANT="kas"
WORLD=false
VERSION=0.0.0-dev.$(git rev-parse --short HEAD)

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

    --version)
      VERSION="$2"
      shift # past argument
      shift # past value
      ;;    

    *) # unknown option
      shift # past argument
    ;;
  esac
done

if [ "$CLEAN" = true ] ; then
  set +e
  rm -rf ./build
  set -e
fi

MACHINE=goldi1

if [ "$WORLD" = true ] ; then
  kas shell world.yml -c "\
    bitbake -k -c build world \
    ; bitbake package-index \
  "
else
  mv "kas.yml" "kas.yml.bak"
  cat "kas.yml.bak" | sed "s/MACHINE_VERSION = "'.*'"/MACHINE_VERSION = \"$VERSION\"/" > "kas.yml"
  kas shell $VARIANT.yml -c "bitbake -k -c build goldi-dev-image goldi-dev-update-bundle goldi-image goldi-update-bundle"
  mv "kas.yml.bak" "kas.yml"
fi

mkdir -p ./dist
shopt -s extglob
cp $(ls ./build/tmp/deploy/images/$MACHINE/$VARIANT-?(dev-)$MACHINE@(.raucb|.wic*) | sort) ./dist/