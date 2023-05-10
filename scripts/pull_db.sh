#!/bin/bash
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)

SERVER=johannes@www.goldi-labs.de


######################################################################################################
ssh $SERVER 'docker exec $(docker ps | grep dev_auth | cut -d" " -f1) cat /app/db/auth.db' > ./auth.db