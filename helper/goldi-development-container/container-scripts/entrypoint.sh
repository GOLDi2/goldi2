#!/bin/sh
set -e

sudo ip link add bond0 type dummy && ifconfig bond0 hw ether 08:00:27:3a:52:9f

/crosslab-entrypoint.sh "$@"
