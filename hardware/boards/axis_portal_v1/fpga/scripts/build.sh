#!/bin/bash

./scripts/generate_project.sh
rm -rf build

result=$(docker run --mac-address=3E-13-AE-04-D8-9C \
            -v $(pwd):/home/diamond/project/1/2/3/ \
            -v $(pwd)/../../../common/fpga/:/home/diamond/project/common/fpga/ \
            gitlab-registry.rz.tu-ilmenau.de/fakia/fachgebiet-iks/goldi/goldi2/registry/lattice-diamond:latest \
            "cd /home/diamond/project/1/2/3 && pnmainc project.tcl" \
        | tee /dev/tty)
if [[ $result =~ "ERROR" ]]; then
  exit -1
fi

mkdir -p dist

result=$(docker run --mac-address=3E-13-AE-04-D8-9C \
            -v $(pwd):/home/diamond/project/ \
            gitlab-registry.rz.tu-ilmenau.de/fakia/fachgebiet-iks/goldi/goldi2/registry/lattice-diamond:latest \
            "cd /home/diamond/project/ && ddtcmd -oft -svfsingle -if \"build/Project_impl1.bit\" -op \"SRAM Erase,Program,Verify\" -of \"dist/bitstream.svf\"" \
        | tee /dev/tty)
if [[ ! $result =~ "Lattice Diamond Deployment Tool has exited successfully." ]]; then
    exit -1
fi

exit 0