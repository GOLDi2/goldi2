#!/bin/bash

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
cd $SCRIPT_DIR/..

. $SCRIPT_DIR/select_board.sh

cat wpa_supplicant.conf | sshpass -p $PASSWORD ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null root@${IP} "cat - > /data/network-config/wpa_supplicant-wlan0.conf"
sshpass -p $PASSWORD ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null root@${IP} "rm -f /data-local/overlay/network-config/wireless.network; rm -f /data-local/overlay/network-config/wired.network"