#!/bin/bash
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)

REPOSITORY=admin@ci.goldi-labs.de:/data/www/ci/goldi
WEB_REPOSITORY=https://ci.goldi-labs.de/goldi

$SCRIPT_DIR/../crosslab/scripts/ci.sh $@ --no-upload
$SCRIPT_DIR/ci.d/ci.sh --include crosslab --repository $REPOSITORY --web-repository $WEB_REPOSITORY $@