#!/bin/bash
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)

SUBCOMMANDVARS=""

# Read the commands
while [[ $# -gt 0 ]]; do
  key="$1"

  case $key in
    --daily)
      DAILY=true
      shift # past argument
      ;;
    --weekly)
      WEEKLY=true
      shift # past argument
      ;;
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

if [ -z "$DAILY" ]; then
  SUBCOMMANDVARS="$SUBCOMMANDVARS --skip-tag daily"
fi

if [ -z "$WEEKLY" ]; then
  SUBCOMMANDVARS="$SUBCOMMANDVARS --skip-tag weekly"
fi

REPOSITORY=admin@ci.goldi-labs.de:/data/www/ci/goldi
WEB_REPOSITORY=https://ci.goldi-labs.de/goldi

#$SCRIPT_DIR/../crosslab/scripts/ci.sh $SUBCOMMANDVARS --no-upload --skip-tag test

set -e
$SCRIPT_DIR/ci.d/ci.sh --include crosslab --repository $REPOSITORY --web-repository $WEB_REPOSITORY $SUBCOMMANDVARS

if [ -n "$DEPLOY" ]; then
  $SCRIPT_DIR/deploy.sh --host johannes@www.goldi-labs.de --dir /opt/goldi --variant $DEPLOY
fi