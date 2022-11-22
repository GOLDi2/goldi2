#!/bin/sh
rpiboot
sleep 10
umount /dev/sda1 && umount /dev/sda2 && umount /dev/sda3 && umount /dev/sda4
sleep 5
bmaptool copy ./build/tmp/deploy/images/io-board/goldi-dev-image-io-board.wic.bz2 /dev/sda
mkdir tmp
mount /dev/sda1 ./tmp
#pwgen | tee password 
echo $PASSWORD | openssl passwd -6 -stdin > ./tmp/password
echo $VPN_CONFIG > ./tmp/vpn-config
sleep 5
umount ./tmp
rm -R ./tmp