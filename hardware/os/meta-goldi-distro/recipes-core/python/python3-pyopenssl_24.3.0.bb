
SUMMARY = "Python wrapper module around the OpenSSL library."
HOMEPAGE = "https://pyopenssl.org/"
AUTHOR = "The pyOpenSSL developers <cryptography-dev@python.org>"
LICENSE = "Apache-2.0"
LIC_FILES_CHKSUM = "file://LICENSE;md5=3b83ef96387f14655fc854ddc3c6bd57"

SRC_URI = "https://files.pythonhosted.org/packages/c1/d4/1067b82c4fc674d6f6e9e8d26b3dff978da46d351ca3bac171544693e085/pyopenssl-24.3.0.tar.gz"
SRC_URI[md5sum] = "2c94bb542cd351fe103d72dca07ca7a1"
SRC_URI[sha256sum] = "49f7a019577d834746bc55c5fce6ecbcec0f2b4ec5ce1cf43a9a173b8138bb36"

S = "${WORKDIR}/pyOpenSSL-24.3.0"

RDEPENDS:${PN} = "python3-cryptography"

inherit pypi pkgconfig setuptools3
