#!/bin/sh
cd ./build/tmp/deploy/images/${BOARD}
sshpass -p $PASSWORD scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null Image root@${IP}:/boot/Image