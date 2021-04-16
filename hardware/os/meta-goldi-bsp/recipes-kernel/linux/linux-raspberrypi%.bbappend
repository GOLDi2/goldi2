FILESEXTRAPATHS_prepend := "${THISDIR}/files:"

SRC_URI_append = " file://rauc.cfg"
CMDLINE_remove = "root=/dev/mmcblk0p2"