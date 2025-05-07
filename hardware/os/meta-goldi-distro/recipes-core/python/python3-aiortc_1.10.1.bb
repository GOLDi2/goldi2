
SUMMARY = "An implementation of WebRTC and ORTC"
HOMEPAGE = "https://github.com/aiortc/aiortc"
AUTHOR = "Jeremy Lainé <jeremy.laine@m4x.org>"
LICENSE = "BSD-3-Clause"
LIC_FILES_CHKSUM = "file://LICENSE;md5=516205adf7b1787435b6e461678cd33e"

SRC_URI = "https://files.pythonhosted.org/packages/8a/f8/408e092748521889c9d33dddcef920afd9891cf6db4615ba6b6bfe114ff8/aiortc-1.10.1.tar.gz \
           "
SRC_URI[md5sum] = "5d439678ccd9ded4022db8d8a4fb5c79"
SRC_URI[sha256sum] = "64926ad86bde20c1a4dacb7c3a164e57b522606b70febe261fada4acf79641b5"

S = "${WORKDIR}/aiortc-1.10.1"

RDEPENDS:${PN} = "python3-aioice python3-av python3-cffi python3-cryptography python3-google-crc32c python3-pyee python3-pylibsrtp python3-pyopenssl"
DEPENDS = "python3-cffi-native libopus libvpx"

inherit setuptools3