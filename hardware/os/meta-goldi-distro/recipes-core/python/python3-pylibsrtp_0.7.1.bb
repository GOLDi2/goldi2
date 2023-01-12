
SUMMARY = "Python wrapper around the libsrtp library"
HOMEPAGE = "https://github.com/aiortc/pylibsrtp"
AUTHOR = "Jeremy Lainé <jeremy.laine@m4x.org>"
LICENSE = "BSD"
LIC_FILES_CHKSUM = "file://LICENSE;md5=f1ded46539ca0c935d7a402de36d2726"

SRC_URI = "https://files.pythonhosted.org/packages/92/e5/09b3e8102ab7b7b73ea6e11e4d2c0e9f8249f3a0494ba3e5b35f419aea3e/pylibsrtp-0.7.1.tar.gz"
SRC_URI[md5sum] = "848a776cc52d7fb75c20f4008a3abd04"
SRC_URI[sha256sum] = "988b9749a2175a312bc59b320a0f6bcdf25b0fc138f2d241d9a91e2d87f164d0"

S = "${WORKDIR}/pylibsrtp-0.7.1"

RDEPENDS:${PN} = "python3-cffi"
DEPENDS = "python3-cffi-native libsrtp"

inherit setuptools3
