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
    IMAGE=$(cat $1 | docker load | tail -1 | grep -Eo "[^ ]+$")
    LOCAL_ID=$(docker inspect --format='{{.Id}}' $IMAGE)
    REMOTE_ID=$(ssh -o StrictHostKeyChecking=no "$HOST" "docker inspect --format='{{.Id}}' $IMAGE")
    if [ "$LOCAL_ID" = "$REMOTE_ID" ]; then
      echo "$IMAGE"
    else
      cat $1 | ssh -o StrictHostKeyChecking=no "$HOST" "cat - | docker load" | tail -1 | grep -Eo "[^ ]+$"
    fi
  }

  # Specify the exact version in the compose file
  COMPOSE=$(cat deployment/production/docker-compose.yml)

  echo "Loading Gateway-Service"
  IMAGE=$(load_docker_image "crosslab/services/gateway/dist/docker-image.tar")
  COMPOSE=$(echo "$COMPOSE" | sed 's/image: gateway-service:latest/image: '$IMAGE'/g')

  echo "Loading Authentication-Service"
  IMAGE=$(load_docker_image "crosslab/services/auth/dist/docker-image.tar")
  COMPOSE=$(echo "$COMPOSE" | sed 's/image: auth-service:latest/image: '$IMAGE'/g')
  
  echo "Loading Authorization-Service"
  IMAGE=$(load_docker_image "crosslab/services/authorization/dist/docker-image.tar")
  COMPOSE=$(echo "$COMPOSE" | sed 's/image: authorization-service:latest/image: '$IMAGE'/g')
  
  echo "Loading Device-Service"
  IMAGE=$(load_docker_image "crosslab/services/device/dist/docker-image.tar")
  COMPOSE=$(echo "$COMPOSE" | sed 's/image: device-service:latest/image: '$IMAGE'/g')
  
  echo "Loading Experiment-Service"
  IMAGE=$(load_docker_image "crosslab/services/experiment/dist/docker-image.tar")
  COMPOSE=$(echo "$COMPOSE" | sed 's/image: experiment-service:latest/image: '$IMAGE'/g')
  
  echo "Loading Federation-Service"
  IMAGE=$(load_docker_image "crosslab/services/federation/dist/docker-image.tar")
  COMPOSE=$(echo "$COMPOSE" | sed 's/image: federation-service:latest/image: '$IMAGE'/g')
  
  echo "Loading LTI-Service"
  IMAGE=$(load_docker_image "crosslab/services/lti/dist/docker-image.tar")
  COMPOSE=$(echo "$COMPOSE" | sed 's/image: lti-service:latest/image: '$IMAGE'/g')
  
  # echo "Loading Update-Service"
  # IMAGE=$(load_docker_image "crosslab/services/update/dist/docker-image.tar")
  # COMPOSE=$(echo "$COMPOSE" | sed 's/image: update-service:latest/image: '$IMAGE'/g')


  # echo "Loading Config Tool"
  # IMAGE=$(load_docker_image "frontend-services/config-tool/dist/docker-image.tar")
  # COMPOSE=$(echo "$COMPOSE" | sed 's/image: esp:latest/image: '$IMAGE'/g')
  
  echo "Loading Experiment Control Panel"
  IMAGE=$(load_docker_image "frontend-services/experiment-control-panel/dist/docker-image.tar")
  COMPOSE=$(echo "$COMPOSE" | sed 's/image: ecp:latest/image: '$IMAGE'/g')
  
  echo "Loading Experiment Control Panel (TI Lab)"
  IMAGE=$(load_docker_image "frontend-services/ti-lab-ecp/dist/docker-image.tar")
  COMPOSE=$(echo "$COMPOSE" | sed 's/image: ti-lab-ecp:latest/image: '$IMAGE'/g')

  echo "Loading Finite State Machine Interpreter"
  IMAGE=$(load_docker_image "frontend-services/fsm-interpreter/dist/docker-image.tar")
  COMPOSE=$(echo "$COMPOSE" | sed 's/image: fsm-interpreter:latest/image: '$IMAGE'/g')
  
  echo "Loading API-Tool"
  IMAGE=$(load_docker_image "frontend-services/apitool/dist/docker-image.tar")
  COMPOSE=$(echo "$COMPOSE" | sed 's/image: apitool:latest/image: '$IMAGE'/g')
  
  echo "Loading Website"
  IMAGE=$(load_docker_image "frontend-services/website/dist/docker-image.tar")
  COMPOSE=$(echo "$COMPOSE" | sed 's/image: frontend:latest/image: '$IMAGE'/g')

  echo "$COMPOSE" | ssh -o StrictHostKeyChecking=no "$HOST" "source $DIR/$VARIANT.secrets; cat - | envsubst > $DIR/$VARIANT/docker-compose.yml"
  ssh -o StrictHostKeyChecking=no "$HOST" "cd $DIR/$VARIANT; docker-compose up -d"
fi