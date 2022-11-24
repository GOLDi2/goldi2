set -e

$(cd ../../../os/ && kas checkout kas.yml)
kas build kas.yml

mkdir -p dist
cp ./build/tmp/deploy/images/io-board/goldi-image-io-board.wic.bmap ./dist/
cp ./build/tmp/deploy/images/io-board/goldi-image-io-board.wic.bz2 ./dist/
cp ./build/tmp/deploy/images/io-board/goldi-dev-image-io-board.wic.bmap ./dist/
cp ./build/tmp/deploy/images/io-board/goldi-dev-image-io-board.wic.bz2 ./dist/
cp ./build/tmp/deploy/images/io-board/goldi-dev-update-bundle-io-board.raucb ./dist/
cp ./build/tmp/deploy/images/io-board/goldi-update-bundle-io-board.raucb ./dist/