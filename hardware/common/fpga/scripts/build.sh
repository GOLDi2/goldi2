#!/bin/bash
set -e

SCRIPT_DIR=$(dirname "$0")

source $DIAMOND_DIR/bin/lin64/diamond_env

#$SCRIPT_DIR/generate_project.sh
rm -rf build

mkdir -p build
pnmainc project.tcl

mkdir -p dist
mkdir -p ~/.config/LatticeSemi
ddtcmd -oft -svfsingle -if "build/Project_impl1.bit" -op "SRAM Erase,Program,Verify" -of "dist/bitstream.svf"