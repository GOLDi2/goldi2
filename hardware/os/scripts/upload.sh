#!/bin/bash

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
cd $SCRIPT_DIR/..

. $SCRIPT_DIR/select_board.sh

cd ./dist
npx --yes http-server -p 8003 -s &
ID=$!

sleep 2
sshpass -p $PASSWORD ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -R 8003:127.0.0.1:8003 root@${IP} "rauc install http://localhost:8003/${VARIANT}-dev-goldi1.raucb"

if [ $? -eq 0 ]; then
    echo "Update successful"
else
    echo "Update failed"
    kill $(ps -o pid= --ppid $(ps -o pid= --ppid $! ))
    exit 1
fi

if [[ $1 == "unsafe" ]]; then
    $SCRIPT_DIR/_upload_boot.sh
fi
kill $(ps -o pid= --ppid $(ps -o pid= --ppid $! ))

timeout 2s sshpass -p $PASSWORD ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null root@${IP} "/sbin/reboot"