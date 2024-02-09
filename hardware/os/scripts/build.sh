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
  kas shell $VARIANT.yml -c "\
    bitbake -c cleanall goldi-crosslab fpga-firmware goldi-config-interface python3-spi-driver python3-crosslab-api-client python3-crosslab-soa-client python3-crosslab-soa-service-electrical python3-crosslab-soa-service-webcam \
    && bitbake -k -c build goldi-dev-image goldi-dev-update-bundle goldi-image goldi-update-bundle \
  "
fi

mkdir -p ./dist
shopt -s extglob
cp $(ls ./build/tmp/deploy/images/$MACHINE/$VARIANT-?(dev-)$MACHINE@(.raucb|.wic*) | sort) ./dist/