#!/bin/bash
set -e

SCRIPT_DIR=$(dirname "$0")
GIT_ROOT=$(git rev-parse --show-toplevel)

cd $SCRIPT_DIR/..
rm -rf .ghdl
mkdir -p .ghdl
cd .ghdl

ghdl -i --std=08 $(fd -L .vhd ../src)
ghdl -i --std=08 $(fd -L .vhd ../mock_src)
ghdl -i --std=08 $(fd -L .vhd ../tests)
ghdl -i --work=machxo2 --std=08 -fsynopsys /usr/local/diamond/3.12/cae_library/simulation/vhdl/machxo2/src/MACHXO2_MEM.vhd
ghdl -i --work=machxo2 --std=08 $GIT_ROOT/hardware/common/lattice-library/machxo2.vhd
ghdl -i --work=machxo2 --std=08 $(fd -L impl.vhd $GIT_ROOT/hardware/common/lattice-library)
set +e
FAILED=false
for file in $(fd -L .vhd ../tests); do
    name=${file##*/}
    base=${name%.vhd}
    out=${file%.vhd}.ghw
    echo "Testing $file"
    ghdl -m --std=08 -fsynopsys -frelaxed-rules $base
    # ghdl --elab-run --std=08 -fsynopsys -frelaxed-rules $base --wave=$out --assert-level=error
    ghdl --elab-run --std=08 -fsynopsys -frelaxed-rules $base --assert-level=error
    if [ $? -ne 0 ]; then
        echo "... failed"
        FAILED=true
    else
        echo "... passed"
    fi
done

if [ "$FAILED" = true ]; then
    exit 1
fi