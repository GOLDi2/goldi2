#!/bin/sh
cd ./build/tmp/deploy/images/${BOARD}
npx http-server -p 8003 -s &
ID=$!

LOCAL_IP=$(ip route get ${IP} | head -1 | cut -d" " -f5)

sleep 2
sshpass -p $PASSWORD ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null root@${IP} "rauc install http://$LOCAL_IP:8003/goldi-dev-update-bundle-${BOARD}.raucb"
timeout 2s sshpass -p $PASSWORD ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null root@${IP} "/sbin/reboot"

kill $(ps -o pid= --ppid $(ps -o pid= --ppid $! ))