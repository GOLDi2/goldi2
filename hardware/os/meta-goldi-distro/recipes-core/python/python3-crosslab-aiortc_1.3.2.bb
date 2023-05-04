
SUMMARY = "An implementation of WebRTC and ORTC"
HOMEPAGE = "https://github.com/aiortc/aiortc"
AUTHOR = "Jeremy Lainé <jeremy.laine@m4x.org>"
LICENSE = "BSD-3-Clause"
LIC_FILES_CHKSUM = "file://LICENSE;md5=907b5e856b2e6bcd8a3cc8d338a6166f"

SRC_URI = "https://files.pythonhosted.org/packages/3b/01/358818acabe9c0ae6ac6d4643200a8b2129b029e66ee94b4cd1be51d9d2e/crosslab-aiortc-1.3.2.tar.gz"
SRC_URI[md5sum] = "ce49ec81a4d9d460bbe72ceadbc66402"
SRC_URI[sha256sum] = "36659b632d1a61be225fe2b338be2e2b672cdf11c3dddf4a882c92a7a84be2c9"

S = "${WORKDIR}/crosslab-aiortc-1.3.2"

RDEPENDS:${PN} = "python3-aioice python3-av python3-cffi python3-cryptography python3-google-crc32c python3-pyee python3-pylibsrtp python3-profile"
DEPENDS = "python3-cffi-native libopus libvpx"

inherit setuptools3