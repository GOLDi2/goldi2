#!/bin/bash

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
cd $SCRIPT_DIR/..

. $SCRIPT_DIR/select_board.sh

sshpass -p $PASSWORD ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null root@${IP}