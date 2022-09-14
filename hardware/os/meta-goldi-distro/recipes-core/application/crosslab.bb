SUMMARY = ""

LICENSE = "CLOSED"
LIC_FILES_CHKSUM=""

SRC_URI = " \
    ${APPLICATION_ARCHIVE};user=token;pswd=${GITLAB_TOKEN} \
    file://goldi-crosslab.service \
"

SRC_URI[sha256sum] = "${APPLICATION_ARCHIVE_CHECKSUM}"

PACKAGE_ARCH = "${MACHINE_ARCH}"

RDEPENDS:${PN} = "python3 python3-spidev python3-asyncio python3-goldi python3-driver fpga-firmware"

do_install() {
    install -d ${D}/usr/bin/
    install -m 0755 ${WORKDIR}/crosslab-client/src/crosslab_client.py ${D}/usr/bin/crosslab_client

    install -d ${D}/${systemd_system_unitdir}
    install -m 0644 ${WORKDIR}/goldi-crosslab.service ${D}/${systemd_system_unitdir}
}

inherit systemd

SYSTEMD_AUTO_ENABLE = "enable"
SYSTEMD_SERVICE:${PN} = "goldi-crosslab.service"

FILES:${PN} = " \
    ${systemd_system_unitdir}/goldi-crosslab.service \
    /usr/bin/crosslab_client \
"

INHIBIT_PACKAGE_DEBUG_SPLIT = "1"