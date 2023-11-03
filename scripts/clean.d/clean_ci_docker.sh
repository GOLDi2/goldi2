#!/bin/bash
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)

SERVER=admin@ci.goldi-labs.de

######################################################################################################

ssh $SERVER "sudo docker save crosslab/devcontainer:latest > crosslab-devcontainer.tar"
ssh $SERVER "sudo docker save goldi2/devcontainer:latest  > goldi-devcontainer.tar"
ssh $SERVER "sudo docker system prune -a -f"
ssh $SERVER "cat crosslab-devcontainer.tar | sudo docker load"
ssh $SERVER "cat goldi-devcontainer.tar | sudo docker load"