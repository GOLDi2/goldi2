SUMMARY = ""

LICENSE = "CLOSED"
LIC_FILES_CHKSUM=""

SRC_URI = " \
    ${APPLICATION_ARCHIVE};user=token;pswd=${GITLAB_TOKEN} \
    file://load-fpga-firmware.service \
"

SRC_URI[sha256sum] = "${APPLICATION_ARCHIVE_CHECKSUM}"

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