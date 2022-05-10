FILESEXTRAPATHS:prepend := "${THISDIR}/files:"

SRC_URI:append = " file://rauc.cfg"
CMDLINE:remove = "root=/dev/mmcblk0p2"
# CMDLINE_remove = "console=serial0,115200" TODO: CHECK with Pierre
