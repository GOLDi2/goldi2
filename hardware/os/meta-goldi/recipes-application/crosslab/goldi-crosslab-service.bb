SUMMARY = "Python Goldi Crosslab"

LICENSE = "CLOSED"
LIC_FILES_CHKSUM=""

SRC_URI = " \
    file://goldi-crosslab.service \
"

RDEPENDS:${PN} = "goldi-crosslab"

do_install() {
    install -d ${D}/${systemd_system_unitdir}
    install -m 0644 ${WORKDIR}/goldi-crosslab.service ${D}/${systemd_system_unitdir}

    sed -i 's/crosslab_client/'"crosslab-${MACHINE_VARIANT}"'/' ${D}/${systemd_system_unitdir}/goldi-crosslab.service
}

inherit systemd

SYSTEMD_AUTO_ENABLE = "enable"
SYSTEMD_SERVICE:${PN} = "goldi-crosslab.service"

FILES:${PN} = " \
    ${systemd_system_unitdir}/goldi-crosslab.service \
"

INHIBIT_PACKAGE_DEBUG_SPLIT = "1"