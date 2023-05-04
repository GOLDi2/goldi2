
SUMMARY = "An implementation of Interactive Connectivity Establishment (RFC 5245)"
HOMEPAGE = "https://github.com/aiortc/aioice"
AUTHOR = "Jeremy Lainé <jeremy.laine@m4x.org>"
LICENSE = "BSD-3-Clause"
LIC_FILES_CHKSUM = "file://LICENSE;md5=f51a4013af37fa3764314e9b051513fd"

SRC_URI = "https://files.pythonhosted.org/packages/2e/fa/08cd290724dd5b892fabc81684910b0f3f4c14d6abd80b24f248cfc7efdb/aioice-0.7.6.tar.gz"
SRC_URI[md5sum] = "e70e17c08c23b06e2b470b3f80af68e4"
SRC_URI[sha256sum] = "1b906e309978c10f58bc85a72f7cd2835cf2127d7551c6c060dae2efec73e1c4"

S = "${WORKDIR}/aioice-0.7.6"

RDEPENDS:${PN} = "python3-dnspython python3-netifaces"

inherit setuptools3
