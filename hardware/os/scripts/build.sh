#!/bin/bash

GIT_ROOT=$(git rev-parse --show-toplevel)
RELATIVE_PATH=$(realpath --relative-to=$GIT_ROOT $(pwd))

docker run -it -v $GIT_ROOT:/git ghcr.io/siemens/kas/kas bash -c "cd /git/$RELATIVE_PATH && ./scripts/.build.sh"
mkdir -p ./dist
cp $(ls ./build/tmp/deploy/images/*/goldi-dev-update-bundle*.*raucb | sort | head -n1) ./dist/goldi-dev-update-bundle.raucb
cp $(ls ./build/tmp/deploy/images/*/goldi-update-bundle*.*raucb | sort | head -n1) ./dist/goldi-update-bundle.raucb
cp $(ls ./build/tmp/deploy/images/*/goldi-dev-image*.*wic.bz2 | sort | head -n1) ./dist/goldi-dev-image.wic.bz2
cp $(ls ./build/tmp/deploy/images/*/goldi-dev-image*.*wic.bmap | sort | head -n1) ./dist/goldi-dev-image.wic.bmap 
cp $(ls ./build/tmp/deploy/images/*/goldi-image*.*wic.bmap | sort | head -n1) ./dist/goldi-image.wic.bz2
cp $(ls ./build/tmp/deploy/images/*/goldi-image*.*wic.bz2 | sort | head -n1) ./dist/goldi-image.wic.bmap 