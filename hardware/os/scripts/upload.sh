#!/bin/sh

if [ -z "$IP" ]; then
    IP=169.254.79.79
fi

cd ./dist
npx --yes http-server -p 8003 -s &
ID=$!

sleep 2
sshpass -p $PASSWORD ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -R 8003:127.0.0.1:8003 root@${IP} "rauc install http://localhost:8003/goldi-dev-update-bundle.raucb"
timeout 2s sshpass -p $PASSWORD ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null root@${IP} "/sbin/reboot"

kill $(ps -o pid= --ppid $(ps -o pid= --ppid $! ))