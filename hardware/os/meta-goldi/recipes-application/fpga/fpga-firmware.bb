SUMMARY = ""

LICENSE = "CLOSED"
LIC_FILES_CHKSUM=""

MULTIMACH_TARGET_SYS = "${MACHINE_VARIANT}-${PACKAGE_ARCH}${TARGET_VENDOR}-${TARGET_OS}"

GIT_DIR = "${THISDIR}/../../../../../"
FILESEXTRAPATHS:prepend := "${GIT_DIR}hardware/boards/${MACHINE_VARIANT}/fpga/dist:"

#OVERRIDES:append = ":${MACHINE_VARIANT}"
#FILESEXTRAPATHS:prepend:io-board := "${GIT_DIR}hardware/boards/io-board/fpga/dist:"

SRC_URI = " \
    file://load-fpga-firmware.service \
    file://bitstream.svf \
"


do_install() {
    install -d ${D}/lib/firmware/lattice/
    cp ${WORKDIR}/bitstream.svf ${D}/lib/firmware/lattice/firmware.svf

    install -d ${D}/${systemd_system_unitdir}
    install -m 0644 ${WORKDIR}/load-fpga-firmware.service ${D}/${systemd_system_unitdir}
}

inherit systemd

SYSTEMD_AUTO_ENABLE = "enable"
SYSTEMD_SERVICE:${PN} = "load-fpga-firmware.service"

FILES:${PN} = " \
    ${systemd_system_unitdir}/load-fpga-firmware.service \
   /lib/firmware/lattice/firmware.svf \
"

INHIBIT_PACKAGE_DEBUG_SPLIT = "1"