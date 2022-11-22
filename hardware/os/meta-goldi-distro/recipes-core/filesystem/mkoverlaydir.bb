SUMMARY = ""

LICENSE = "CLOSED"
LIC_FILES_CHKSUM=""

SRC_URI = " \
    file://mkoverlaydir.service \
"

inherit systemd

SYSTEMD_AUTO_ENABLE = "enable"
SYSTEMD_SERVICE:${PN} = "mkoverlaydir.service"

do_install() {
    install -d ${D}/${systemd_system_unitdir}
    install -m 0644 ${WORKDIR}/mkoverlaydir.service ${D}/${systemd_system_unitdir}
    
    install -d ${D}/data-local
    install -d ${D}/data-factory
    install -d ${D}/data
}

FILES:${PN} = " \
    ${systemd_system_unitdir}/mkoverlaydir.service \
    data-local \
    data-factory \
    data \
"

INHIBIT_PACKAGE_DEBUG_SPLIT = "1"