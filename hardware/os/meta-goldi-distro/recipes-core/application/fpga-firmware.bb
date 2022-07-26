SUMMARY = ""

LICENSE = "CLOSED"
LIC_FILES_CHKSUM=""

SRC_URI = " \
    https://gitlab.tu-ilmenau.de/api/v4/projects/3776/packages/generic/3_axis_v1/0.0.1/dist.tar.gz;user=token;pswd=${GITLAB_TOKEN} \
    file://load-fpga-firmware.service \
"

SRC_URI[sha256sum] = "cdfd8fa0922c448892ab71a8eb575f8f326e5fe3a7d3adf832679c8b4c7dc6bd"

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