#!/bin/bash
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)

SUBCOMMANDVARS=""

# Read the commands
while [[ $# -gt 0 ]]; do
  key="$1"

  case $key in
    --deploy)
      DEPLOY="$2"
      shift # past argument
      shift # past value
      ;;

    *) # unknown option
      SUBCOMMANDVARS="$SUBCOMMANDVARS $1"
      shift # past argument
    ;;
  esac
done

REPOSITORY=admin@ci.goldi-labs.de:/data/www/ci/goldi
WEB_REPOSITORY=https://ci.goldi-labs.de/goldi

$SCRIPT_DIR/../crosslab/scripts/ci.sh $@ --no-upload
$SCRIPT_DIR/ci.d/ci.sh --include crosslab --repository $REPOSITORY --web-repository $WEB_REPOSITORY $SUBCOMMANDVARS

if [ -n "$DEPLOY" ]; then
  $SCRIPT_DIR/deploy.sh --host johannes@www.goldi-labs.de --dir /opt/goldi --variant $DEPLOY
fi