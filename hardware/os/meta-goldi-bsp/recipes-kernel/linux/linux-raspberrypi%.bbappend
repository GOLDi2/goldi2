FILESEXTRAPATHS_prepend := "${THISDIR}/files:"

SRC_URI_append = " file://rauc.cfg"
CMDLINE_remove = "root=/dev/mmcblk0p2"
CMDLINE_remove = "console=serial0,115200"
