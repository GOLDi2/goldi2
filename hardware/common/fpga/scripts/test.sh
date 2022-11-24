mkdir -p .ghdl
#docker run -it \
# -v $(pwd):/project/1/2/3/ \
# -v $(pwd)/../../../common/fpga/:/project/common/fpga/ \
# ghdl/ghdl:ubuntu20-llvm-10 bash -c \
# "cd /project/1/2/3/.ghdl && ghdl -a --std=08 --work=common ../src/common/*.vhd"

# docker run -it \
#   -v $(pwd):/project/1/2/3/ \
#   -v $(pwd)/../../../common/fpga/:/project/common/fpga/ \
#   ghdl/ghdl:ubuntu20-llvm-10 bash -c \
#   "cd /project/1/2/3/.ghdl && ghdl -a --std=08 ../src/top_level.vhd"

docker run \
  -v $(pwd)/scripts:/project/scripts \
  -v $(pwd):/project/1/2/3/ \
  -v $(pwd)/../../../common/fpga/:/project/common/fpga/ \
  ghdl/ghdl:ubuntu20-llvm-10 /project/scripts/.test.sh