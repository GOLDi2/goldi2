FILESEXTRAPATHS:prepend := "${THISDIR}/files:"

SRC_URI += " \
    file://goldi1-overlay.dts;subdir=git/arch/${ARCH}/boot/dts/overlays \
"