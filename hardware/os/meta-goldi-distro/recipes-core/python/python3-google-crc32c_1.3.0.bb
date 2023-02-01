
SUMMARY = "A python wrapper of the C library 'Google CRC32C'"
HOMEPAGE = "https://github.com/googleapis/python-crc32c"
AUTHOR = "Google LLC <googleapis-packages@google.com>"
LICENSE = "Apache-2.0"
LIC_FILES_CHKSUM = "file://LICENSE;md5=75b3827ef914c0cd0b544360c97fb0df"

SRC_URI = "https://files.pythonhosted.org/packages/db/de/477cdcfd3ba2877cdf798f0328ea6aa79b2e632d169f5099d6240c4c4ebf/google-crc32c-1.3.0.tar.gz"
SRC_URI[md5sum] = "5e1d78c2e5e0f7e2e1f2a95b630f5c3f"
SRC_URI[sha256sum] = "276de6273eb074a35bc598f8efbc00c7869c5cf2e29c90748fccc8c898c244df"

S = "${WORKDIR}/google-crc32c-1.3.0"

RDEPENDS:${PN} = ""

DEPENDS += "\
    ${PYTHON_PN}-cffi-native \
    crc32c \
"

inherit setuptools3
