SUMMARY = ""

LICENSE = "CLOSED"
LIC_FILES_CHKSUM=""

SRC_URI = " \
    file://growpart.service \
"

RDEPENDS:${PN}="parted"

inherit systemd

SYSTEMD_AUTO_ENABLE = "enable"
SYSTEMD_SERVICE:${PN} = "growpart.service"

do_install() {
    install -d ${D}/${systemd_system_unitdir}
    install -m 0644 ${WORKDIR}/growpart.service ${D}/${systemd_system_unitdir}
}

FILES:${PN} = " \
    ${systemd_system_unitdir}/mkoverlaydir.service \
"

INHIBIT_PACKAGE_DEBUG_SPLIT = "1"