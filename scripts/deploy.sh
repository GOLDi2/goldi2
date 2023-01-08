#!/bin/bash
set -e

SCRIPT_DIR=$(dirname "$0")
cd "$SCRIPT_DIR"/../

# Default values
DEPOLY_GLOBAL=false

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

  ssh "$HOST" "cd $DIR/prod; docker-compose down || true"
  # Copy all docker images to the server
  cat "backend-services/gateway/dist/docker-image.tar" | ssh "$HOST" "cat - | docker load"
  cat "backend-services/auth/dist/docker-image.tar" | ssh "$HOST" "cat - | docker load"
  cat "backend-services/device/dist/docker-image.tar" | ssh "$HOST" "cat - | docker load"
  cat "backend-services/experiment/dist/docker-image.tar" | ssh "$HOST" "cat - | docker load"
  cat "backend-services/federation/dist/docker-image.tar" | ssh "$HOST" "cat - | docker load"
  cat "backend-services/update/dist/docker-image.tar" | ssh "$HOST" "cat - | docker load"

  # Specify the exact version in the compose file
  COMPOSE=$(cat helper/deploy-files/docker-compose.instance.yml)
  COMPOSE=$(echo "$COMPOSE" | sed 's/image: gateway-service/image: gateway-service:'$(git -C crosslab rev-parse --short HEAD)'/g')
  COMPOSE=$(echo "$COMPOSE" | sed 's/image: auth-service/image: auth-service:'$(git -C crosslab rev-parse --short HEAD)'/g')
  COMPOSE=$(echo "$COMPOSE" | sed 's/image: device-service/image: device-service:'$(git -C crosslab rev-parse --short HEAD)'/g')
  COMPOSE=$(echo "$COMPOSE" | sed 's/image: experiment-service/image: experiment-service:'$(git -C crosslab rev-parse --short HEAD)'/g')
  COMPOSE=$(echo "$COMPOSE" | sed 's/image: federation-service/image: federation-service:'$(git -C crosslab rev-parse --short HEAD)'/g')
  COMPOSE=$(echo "$COMPOSE" | sed 's/image: update-service/image: update-service:'$(git -C crosslab rev-parse --short HEAD)'/g')

  echo "$COMPOSE" | ssh "$HOST" "source $DIR/prod.secrets; cat - | envsubst > $DIR/prod/docker-compose.yml"
  ssh "$HOST" "cd $DIR/prod; docker-compose up -d"
fi