DESCRIPTION = "GOLDi application packagegroup"
SUMMARY = "GOLDi packagegroup"

inherit packagegroup

RDEPENDS:${PN} = "fpga-firmware python3-driver manual-control-script"
