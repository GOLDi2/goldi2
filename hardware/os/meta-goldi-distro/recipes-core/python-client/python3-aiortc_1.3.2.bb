
SUMMARY = "An implementation of WebRTC and ORTC"
HOMEPAGE = "https://github.com/aiortc/aiortc"
AUTHOR = "Jeremy Lainé <jeremy.laine@m4x.org>"
LICENSE = "BSD"
LIC_FILES_CHKSUM = "file://LICENSE;md5=907b5e856b2e6bcd8a3cc8d338a6166f"

PV = "1.3.2+git${SRCPV}"

SRC_URI = "git://github.com/GOLDi2/aiortc.git;protocol=https;branch=main"
SRCREV = "6a84510edf538e19e2102140a34f6a35454c647e"

S = "${WORKDIR}/git"

RDEPENDS:${PN} = "python3-aioice python3-av python3-cffi python3-cryptography python3-google-crc32c python3-pyee python3-pylibsrtp python3-profile"
DEPENDS = "python3-cffi-native libopus libvpx"

inherit setuptools3
