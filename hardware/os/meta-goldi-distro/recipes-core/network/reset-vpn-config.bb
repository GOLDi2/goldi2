SUMMARY = ""

LICENSE = "CLOSED"
LIC_FILES_CHKSUM=""

SRC_URI = " \
    file://reset-vpn-config.service \
    file://reset-vpn-config \
"

inherit systemd

SYSTEMD_AUTO_ENABLE = "enable"
SYSTEMD_SERVICE:${PN} = "reset-vpn-config.service"

do_install() {
    install -d ${D}/${systemd_system_unitdir}
    install -m 0644 ${WORKDIR}/reset-vpn-config.service ${D}/${systemd_system_unitdir}
    install -d ${D}/usr/bin/
    install -m 0755 ${WORKDIR}/reset-vpn-config ${D}/usr/bin/
}

FILES:${PN} = " \
    ${systemd_system_unitdir}/reset-vpn-config.service \
    /usr/bin/reset-vpn-config \
"

INHIBIT_PACKAGE_DEBUG_SPLIT = "1"