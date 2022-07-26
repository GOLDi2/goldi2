SUMMARY = ""

LICENSE = "CLOSED"
LIC_FILES_CHKSUM=""

SRC_URI = " \
    https://gitlab.tu-ilmenau.de/api/v4/projects/3776/packages/generic/3_axis_v1/0.0.1/dist.tar.gz;user=token;pswd=${GITLAB_TOKEN} \
"

SRC_URI[sha256sum] = "cdfd8fa0922c448892ab71a8eb575f8f326e5fe3a7d3adf832679c8b4c7dc6bd"

RDEPENDS:${PN} = "python3 python3-spidev"

do_install() {
    install -d ${D}/usr/bin/
    install -m 0755 ${WORKDIR}/manual_control.py ${D}/usr/bin/manual_control
}

FILES:${PN} = " \
   /usr/bin/manual_control \
"

INHIBIT_PACKAGE_DEBUG_SPLIT = "1"