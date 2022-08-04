SUMMARY = ""

LICENSE = "CLOSED"
LIC_FILES_CHKSUM=""

SRC_URI = " \
    file://goldi-vpn.service \
"

RDEPENDS:${PN} = "reset-vpn-config wireguard-tools"

inherit systemd

SYSTEMD_AUTO_ENABLE = "enable"
SYSTEMD_SERVICE:${PN} = "goldi-vpn.service"

do_install() {
    install -d ${D}/${systemd_system_unitdir}
    install -m 0644 ${WORKDIR}/goldi-vpn.service ${D}/${systemd_system_unitdir}
}

FILES:${PN} = " \
    ${systemd_system_unitdir}/goldi-vpn.service \
"

INHIBIT_PACKAGE_DEBUG_SPLIT = "1"