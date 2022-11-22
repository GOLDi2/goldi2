FILESEXTRAPATHS:prepend := "${THISDIR}/files:"

SRC_URI:append:rpi = "\
    file://0001-always-set-fdt_addr-with-firmware-provided-FDT-addre.patch \
"