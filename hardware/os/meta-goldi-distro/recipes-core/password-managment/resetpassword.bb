SUMMARY = ""

LICENSE = "CLOSED"
LIC_FILES_CHKSUM=""

SRC_URI = " \
    file://resetpassword.service \
"

inherit systemd

SYSTEMD_AUTO_ENABLE = "enable"
SYSTEMD_SERVICE:${PN} = "resetpassword.service"

do_install() {
    install -d ${D}/${systemd_system_unitdir}
    install -m 0644 ${WORKDIR}/resetpassword.service ${D}/${systemd_system_unitdir}
}

FILES:${PN} = " \
    ${systemd_system_unitdir}/resetpassword.service \
"

INHIBIT_PACKAGE_DEBUG_SPLIT = "1"