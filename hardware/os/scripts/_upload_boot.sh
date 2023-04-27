#!/bin/bash

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
cd $SCRIPT_DIR/..

# Backup password and vpn-config from boot partition
passwordBackup=$(sshpass -p $PASSWORD ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null root@${IP} cat /boot/password 2>/dev/null)
vpnBackup=$(sshpass -p $PASSWORD ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null root@${IP} cat /boot/vpn-config 2>/dev/null)

# if dist goldi-dev-image.wic does not exist
bzip2 -dk dist/goldi-dev-image.wic.bz2

sudo losetup -P /dev/loop1 dist/goldi-dev-image.wic
# dd first partion to 
sleep 5
sudo dd if=/dev/loop1p1 status=progress | sshpass -p $PASSWORD ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null root@${IP} "dd of=/dev/mmcblk0p1"

# restore password and vpn-config
if [ ! -z "$passwordBackup" ]; then
    sshpass -p $PASSWORD ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null root@${IP} "echo $passwordBackup > /boot/password" 2>/dev/null
fi
if [ ! -z "$vpnBackup" ]; then
    sshpass -p $PASSWORD ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null root@${IP} "echo $vpnBackup > /boot/vpn-config" 2>/dev/null
fi

# remove loop device
sudo losetup -d /dev/loop1
rm dist/goldi-dev-image.wic