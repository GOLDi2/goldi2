
SUMMARY = "An implementation of WebRTC and ORTC"
HOMEPAGE = "https://github.com/aiortc/aiortc"
AUTHOR = "Jeremy Lainé <jeremy.laine@m4x.org>"
LICENSE = "BSD"
LIC_FILES_CHKSUM = "file://LICENSE;md5=907b5e856b2e6bcd8a3cc8d338a6166f"

SRC_URI = "https://files.pythonhosted.org/packages/2d/66/23c71cede7ebb0cbda6b4552dd900ef83fde96bff07b5341f0e7325ef134/aiortc-1.3.2.tar.gz"
SRC_URI[md5sum] = "3f43e88416113141b0196bdf6c37b444"
SRC_URI[sha256sum] = "15608d7fcf09502d1b8c19b8a63bc22966090ee0761ac9a755e9f747f46d67ab"

S = "${WORKDIR}/aiortc-1.3.2"

RDEPENDS:${PN} = "python3-aioice python3-av python3-cffi python3-cryptography python3-google-crc32c python3-pyee python3-pylibsrtp python3-profile"
DEPENDS = "python3-cffi-native libopus libvpx"

inherit setuptools3
