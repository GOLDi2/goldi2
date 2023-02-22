#!/bin/bash
set -e

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
cd "$SCRIPT_DIR"/../

# Default values
DEPOLY_GLOBAL=false
VARIANT=prod

# Read the commands
while [[ $# -gt 0 ]]; do
  key="$1"

  case $key in
    -g|--global)
      DEPOLY_GLOBAL=true
      shift # past argument
      ;;

    -h|--host)
      HOST="$2"
      shift # past argument
      shift # past value
      ;;

    --variant)
      VARIANT="$2"
      shift # past argument
      shift # past value
      ;;

    -d|--dir)
      DIR="$2"
      shift # past argument
      shift # past value
      ;;

    *) # unknown option
      shift # past argument
    ;;
  esac
done

if [ -z "$HOST" ]; then
  echo "Host is not set"
  exit 1
fi

if [ -z "$DIR" ]; then
  echo "Directory is not set"
  exit 1
fi

# Copy the files
if [ "$DEPOLY_GLOBAL" = true ]; then
  echo "Deploying global docker-compose"

  ssh "$HOST" "cd $DIR/global; docker-compose down || true"
  cat helper/deploy-files/docker-compose.global.yml | ssh "$HOST" "source $DIR/global.secrets; cat - | envsubst > $DIR/global/docker-compose.yml"
  ssh "$HOST" "cd $DIR/global; docker-compose up -d"

else
  echo "Deploying instance"

  ssh "$HOST" "cd $DIR/$VARIANT; docker-compose down || true"

  function load_docker_image(){
    cat $1 | ssh "$HOST" "cat - | docker load" | sed -e 's/^.* //'
  }

  # Specify the exact version in the compose file
  COMPOSE=$(cat helper/deploy-files/docker-compose.instance.yml)
  COMPOSE=$(echo "$COMPOSE" | sed 's/image: gateway-service/image: '$(load_docker_image "backend-services/gateway/dist/docker-image.tar")'/g')
  COMPOSE=$(echo "$COMPOSE" | sed 's/image: auth-service/image: '$(load_docker_image "backend-services/auth/dist/docker-image.tar")'/g')
  COMPOSE=$(echo "$COMPOSE" | sed 's/image: device-service/image: '$(load_docker_image "backend-services/device/dist/docker-image.tar")'/g')
  COMPOSE=$(echo "$COMPOSE" | sed 's/image: experiment-service/image: '$(load_docker_image "backend-services/experiment/dist/docker-image.tar")'/g')
  COMPOSE=$(echo "$COMPOSE" | sed 's/image: federation-service/image: '$(load_docker_image "backend-services/federation/dist/docker-image.tar")'/g')
  COMPOSE=$(echo "$COMPOSE" | sed 's/image: update-service/image: '$(load_docker_image "backend-services/update/dist/docker-image.tar")'/g')

  COMPOSE=$(echo "$COMPOSE" | sed 's/image: esp/image: '$( load_docker_image "frontend-services/config-tool/dist/docker-image.tar")'/g')
  COMPOSE=$(echo "$COMPOSE" | sed 's/image: ecp/image: '$(load_docker_image "frontend-services/experiment-control-panel/dist/docker-image.tar")'/g')
  COMPOSE=$(echo "$COMPOSE" | sed 's/image: frontend/image: '$(load_docker_image "frontend-services/website/dist/docker-image.tar")'/g')

  echo "$COMPOSE" | ssh "$HOST" "source $DIR/$VARIANT.secrets; cat - | envsubst > $DIR/$VARIANT/docker-compose.yml"
  ssh "$HOST" "cd $DIR/$VARIANT; docker-compose up -d"
fi