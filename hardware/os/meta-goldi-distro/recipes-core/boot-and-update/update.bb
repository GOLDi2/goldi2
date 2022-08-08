SUMMARY = ""

LICENSE = "CLOSED"
LIC_FILES_CHKSUM=""

SRC_URI = " \
    file://update.service \
    file://update \
"

RDEPENDS:${PN}="parted"

inherit systemd

SYSTEMD_AUTO_ENABLE = "enable"
SYSTEMD_SERVICE:${PN} = "update.service"

do_install() {
    install -d ${D}/${systemd_system_unitdir}
    install -m 0644 ${WORKDIR}/update.service ${D}/${systemd_system_unitdir}
    install -d ${D}/usr/bin/
    install -m 0755 ${WORKDIR}/update ${D}/usr/bin/
}

FILES:${PN} = " \
    ${systemd_system_unitdir}/update.service \
    /usr/bin/update \
"

INHIBIT_PACKAGE_DEBUG_SPLIT = "1"