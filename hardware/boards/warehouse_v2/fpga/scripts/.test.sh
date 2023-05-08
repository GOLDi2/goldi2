#!/bin/bash

cd /project/1/2/3/.ghdl
ghdl -a --std=08 ../tests/*.vhd
for file in ../tests/*.vhd; do
    name=${file##*/}
    base=${name%.vhd}
    ghdl --elab-run --std=08 $base --wave=../tests/${base}.ghw
done