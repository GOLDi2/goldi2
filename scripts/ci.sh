#!/bin/bash

REPOSITORY=admin@ci.goldi-labs.de:/data/www/ci/goldi
WEB_REPOSITORY=https://ci.goldi-labs.de/goldi

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
$SCRIPT_DIR/../crosslab/scripts/ci.sh --skip-upload $@ && $SCRIPT_DIR/helper/ci.sh --repository $REPOSITORY --web-repository $WEB_REPOSITORY $@