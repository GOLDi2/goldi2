
SUMMARY = "Python wrapper around the libsrtp library"
HOMEPAGE = "https://github.com/aiortc/pylibsrtp"
AUTHOR = "Jeremy Lainé <jeremy.laine@m4x.org>"
LICENSE = "BSD-3-Clause"
LIC_FILES_CHKSUM = "file://LICENSE;md5=070894982bc73fba87975c9113bfe95a"

SRC_URI = "https://files.pythonhosted.org/packages/2e/49/1c5101ecfeda540699e0754dddfc91c401fbf736ebe99d66e59fe3dad2ba/pylibsrtp-0.11.0.tar.gz"
SRC_URI[md5sum] = "2b3783f9229304c04361c47d3206baae"
SRC_URI[sha256sum] = "5a8d19b1448baebde5ae3cedfa51f10e8ada3d9d99f43046ced0ecf1c105b8ec"

S = "${WORKDIR}/pylibsrtp-0.11.0"

RDEPENDS:${PN} = "python3-cffi"
DEPENDS = "python3-cffi-native libsrtp"

inherit setuptools3
