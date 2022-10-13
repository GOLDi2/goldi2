FILESEXTRAPATHS:prepend := "${THISDIR}/files:"

SRC_URI += " \
    file://microcontroller-overlay.dts;subdir=git/arch/${ARCH}/boot/dts/overlays \
"