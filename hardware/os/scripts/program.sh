#!/bin/sh
for i in $(seq 1 5); do
    devices=$(find /dev/disk/by-id -name "usb-RPi-*")
    # if there are no devices
    if [ -z "$devices" ]; then
        echo "No devices found. Running rpiboot"
        timeout 5 rpiboot
        sleep 3
    else
        break
    fi
done
if [ -z "$devices" ]; then
    echo "No devices found. Exiting"
    exit 1
fi

# find device with shortest name
device=$(realpath $(echo "$devices" | sort -n | head -n1))

echo "Found device $device"

sudo bmaptool copy ./dist/goldi-dev-image.wic.bz2 $device

exit 0
mkdir tmp
mount /dev/sda1 ./tmp
#pwgen | tee password 
echo $PASSWORD | openssl passwd -6 -stdin > ./tmp/password
echo $VPN_CONFIG > ./tmp/vpn-config
sleep 5
umount ./tmp
rm -R ./tmp