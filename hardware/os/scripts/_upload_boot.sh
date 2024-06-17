#!/bin/bash

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
cd $SCRIPT_DIR/..

rm -rf ./backup
mkdir backup
# Backup password and vpn-config from boot partition
sshpass -p $PASSWORD scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null root@${IP}:/boot/password ./backup/password
sshpass -p $PASSWORD scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null root@${IP}:/boot/vpn-config ./backup/vpn-config
sshpass -p $PASSWORD scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null root@${IP}:/boot/uboot.env ./backup/uboot.env

# if dist ${VARIANT}-dev-goldi1.wic does not exist
bzip2 -dk dist/${VARIANT}-dev-goldi1.wic.bz2

sudo losetup -P /dev/loop1 dist/${VARIANT}-dev-goldi1.wic
# dd first partion to 
sleep 5
sshpass -p $PASSWORD ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null root@${IP} "umount /dev/mmcblk0p1"
sudo dd if=/dev/loop1p1 status=progress | sshpass -p $PASSWORD ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null root@${IP} "dd of=/dev/mmcblk0p1"
sshpass -p $PASSWORD ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null root@${IP} "mount /dev/mmcblk0p1 /boot"

# restore password and vpn-config
sshpass -p $PASSWORD scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ./backup/password root@${IP}:/boot/password
sshpass -p $PASSWORD scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ./backup/vpn-config root@${IP}:/boot/vpn-config
sshpass -p $PASSWORD scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ./backup/uboot.env root@${IP}:/boot/uboot.env
rm -rf ./backup

# remove loop device
sudo losetup -d /dev/loop1
rm dist/${VARIANT}-dev-goldi1.wic