
SUMMARY = "An implementation of WebRTC and ORTC"
HOMEPAGE = "https://github.com/aiortc/aiortc"
AUTHOR = "Jeremy Lainé <jeremy.laine@m4x.org>"
LICENSE = "BSD-3-Clause"
LIC_FILES_CHKSUM = "file://LICENSE;md5=86b545e2a9ac9da41806b21ff0233b1f"

SRC_URI = "https://files.pythonhosted.org/packages/ed/a3/f9d3708f46605948bc3bbd5ab0468444f29354b17d3cf7305dac0f38ef36/crosslab-aiortc-1.5.0.tar.gz"
SRC_URI[md5sum] = "c9aa710b38ef32c581be2431263d0455"
SRC_URI[sha256sum] = "26ef83675fbc0468c535e6a22be53ac52cdefacfe5ce62c9f5d96c451de3d7c3"

S = "${WORKDIR}/crosslab-aiortc-1.5.0"

RDEPENDS:${PN} = "python3-aioice python3-av python3-cffi python3-cryptography python3-google-crc32c python3-pyee python3-pylibsrtp python3-profile python3-pyopenssl"
DEPENDS = "python3-cffi-native libopus libvpx"

inherit setuptools3