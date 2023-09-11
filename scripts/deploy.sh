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

  ssh -o StrictHostKeyChecking=no "$HOST" "cd $DIR/global; docker-compose down || true"
  cat helper/deploy-files/docker-compose.global.yml | ssh -o StrictHostKeyChecking=no "$HOST" "source $DIR/global.secrets; cat - | envsubst > $DIR/global/docker-compose.yml"
  ssh -o StrictHostKeyChecking=no "$HOST" "cd $DIR/global; docker-compose up -d"

else
  echo "Deploying instance"

  ssh -o StrictHostKeyChecking=no "$HOST" "cd $DIR/$VARIANT; docker-compose down || true"

  ssh -o StrictHostKeyChecking=no "$HOST" "mkdir -p $DIR/$VARIANT/data"

  ssh -o StrictHostKeyChecking=no "$HOST" "rm -rf $DIR/$VARIANT/config"
  scp -r -o StrictHostKeyChecking=no deployment/production/config "$HOST:$DIR/$VARIANT/config"

  function load_docker_image(){
    cat $1 | ssh -o StrictHostKeyChecking=no "$HOST" "cat - | docker load" | tail -1 | grep -Eo "[^ ]+$"
  }

  # Specify the exact version in the compose file
  COMPOSE=$(cat deployment/production/docker-compose.yml)
  echo "Loading Gateway-Service"
  # echo "$(load_docker_image "crosslab/services/gateway/dist/docker-image.tar")"
  COMPOSE=$(echo "$COMPOSE" | sed 's/image: gateway-service:latest/image: '$(load_docker_image "crosslab/services/gateway/dist/docker-image.tar")'/g')
  echo "Loading Authentication-Service"
  # echo "$(load_docker_image "crosslab/services/auth/dist/docker-image.tar")"
  COMPOSE=$(echo "$COMPOSE" | sed 's/image: auth-service:latest/image: '$(load_docker_image "crosslab/services/auth/dist/docker-image.tar")'/g')
  echo "Loading Authorization-Service"
  # echo "$(load_docker_image "crosslab/services/authorization/dist/docker-image.tar")"
  COMPOSE=$(echo "$COMPOSE" | sed 's/image: authorization-service:latest/image: '$(load_docker_image "crosslab/services/authorization/dist/docker-image.tar")'/g')
  echo "Loading Device-Service"
  # echo "$(load_docker_image "crosslab/services/device/dist/docker-image.tar")"
  COMPOSE=$(echo "$COMPOSE" | sed 's/image: device-service:latest/image: '$(load_docker_image "crosslab/services/device/dist/docker-image.tar")'/g')
  echo "Loading Experiment-Service"
  # echo "$(load_docker_image "crosslab/services/experiment/dist/docker-image.tar")"
  COMPOSE=$(echo "$COMPOSE" | sed 's/image: experiment-service:latest/image: '$(load_docker_image "crosslab/services/experiment/dist/docker-image.tar")'/g')
  echo "Loading Federation-Service"
  # echo "$(load_docker_image "crosslab/services/federation/dist/docker-image.tar")"
  COMPOSE=$(echo "$COMPOSE" | sed 's/image: federation-service:latest/image: '$(load_docker_image "crosslab/services/federation/dist/docker-image.tar")'/g')
  echo "Loading LTI-Service"
  # echo "$(load_docker_image "crosslab/services/lti/dist/docker-image.tar")"
  COMPOSE=$(echo "$COMPOSE" | sed 's/image: lti-service:latest/image: '$(load_docker_image "crosslab/services/lti/dist/docker-image.tar")'/g')
  echo "Loading Update-Service"
  # echo "$(load_docker_image "crosslab/services/update/dist/docker-image.tar")"
  COMPOSE=$(echo "$COMPOSE" | sed 's/image: update-service:latest/image: '$(load_docker_image "crosslab/services/update/dist/docker-image.tar")'/g')

  echo "Loading Config Tool"
  # echo "$(load_docker_image "frontend-services/config-tool/dist/docker-image.tar")"
  # COMPOSE=$(echo "$COMPOSE" | sed 's/image: esp:latest/image: '$(load_docker_image "frontend-services/config-tool/dist/docker-image.tar")'/g')
  echo "Loading Experiment Control Panel"
  # echo "$(load_docker_image "frontend-services/experiment-control-panel/dist/docker-image.tar")"
  COMPOSE=$(echo "$COMPOSE" | sed 's/image: ecp:latest/image: '$(load_docker_image "frontend-services/experiment-control-panel/dist/docker-image.tar")'/g')
  echo "Loading Website"
  # echo "$(load_docker_image "frontend-services/website/dist/docker-image.tar")"
  COMPOSE=$(echo "$COMPOSE" | sed 's/image: frontend:latest/image: '$(load_docker_image "frontend-services/website/dist/docker-image.tar")'/g')

  echo "$COMPOSE" | ssh -o StrictHostKeyChecking=no "$HOST" "source $DIR/$VARIANT.secrets; cat - | envsubst > $DIR/$VARIANT/docker-compose.yml"
  ssh -o StrictHostKeyChecking=no "$HOST" "cd $DIR/$VARIANT; docker-compose up -d"
fi