SUMMARY = ""

LICENSE = "CLOSED"
LIC_FILES_CHKSUM=""

SRC_URI = " \
        ${APPLICATION_ARCHIVE};user=token;pswd=${GITLAB_TOKEN} \
"

SRC_URI[sha256sum] = "${APPLICATION_ARCHIVE_CHECKSUM}"


RDEPENDS:${PN} = "python3 python3-spidev"

do_install() {
    install -d ${D}/usr/bin/
    install -m 0755 ${WORKDIR}/manual_control.py ${D}/usr/bin/manual_control
}

FILES:${PN} = " \
   /usr/bin/manual_control \
"

INHIBIT_PACKAGE_DEBUG_SPLIT = "1"