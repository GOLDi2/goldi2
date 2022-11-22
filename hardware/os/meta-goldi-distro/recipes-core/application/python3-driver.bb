SUMMARY = ""

LICENSE = "CLOSED"
LIC_FILES_CHKSUM=""

SRC_URI = " \
        ${APPLICATION_ARCHIVE};user=token;pswd=${GITLAB_TOKEN} \
"
PACKAGE_ARCH = "${MACHINE_ARCH}"

SRC_URI[sha256sum] = "${APPLICATION_ARCHIVE_CHECKSUM}"

DEPENDS = "python3"
RDEPENDS:${PN} = "python3 python3-spidev"

S = "${WORKDIR}/driver"

inherit setuptools3
