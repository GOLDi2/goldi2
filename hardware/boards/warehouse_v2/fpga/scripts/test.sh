mkdir -p .ghdl

docker run -it \
  -v $(pwd)/scripts:/project/scripts \
  -v $(pwd):/project/1/2/3/ \
  -v $(pwd)/../../../common/fpga/:/project/common/fpga/ \
  ghdl/ghdl:ubuntu20-llvm-10 /project/scripts/.test.sh