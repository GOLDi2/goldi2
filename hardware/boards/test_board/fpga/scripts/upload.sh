#!/bin/sh
sshpass -p $PASSWORD scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null dist/bitstream.svf root@${IP}:/lib/firmware/lattice/firmware.svf