#!/bin/sh

IP=169.254.79.79

sshpass -p $PASSWORD scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null dist/bitstream.svf root@${IP}:/lib/firmware/lattice/firmware.svf
sshpass -p $PASSWORD ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null root@${IP} "systemctl start load-fpga-firmware.service"