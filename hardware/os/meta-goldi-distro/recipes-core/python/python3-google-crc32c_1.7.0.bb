
SUMMARY = "A python wrapper of the C library 'Google CRC32C'"
HOMEPAGE = "https://github.com/googleapis/python-crc32c"
AUTHOR = "Google LLC <googleapis-packages@google.com>"
LICENSE = "Apache-2.0"
LIC_FILES_CHKSUM = "file://LICENSE;md5=3b83ef96387f14655fc854ddc3c6bd57"

SRC_URI = "https://files.pythonhosted.org/packages/fd/c6/bd09366753b49353895ed73bad74574d9086b26b53bb5b9213962009719a/google_crc32c-1.7.0.tar.gz"
SRC_URI[md5sum] = "157ef14cc08bef4c6089f6d3953d1951"
SRC_URI[sha256sum] = "c8c15a04b290c7556f277acc55ad98503a8bc0893ea6860fd5b5d210f3f558ce"

S = "${WORKDIR}/google_crc32c-1.7.0"

RDEPENDS:${PN} = ""

DEPENDS += "\
    ${PYTHON_PN}-cffi-native \
    crc32c \
"

inherit setuptools3
