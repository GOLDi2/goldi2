
SUMMARY = "Python wrapper module around the OpenSSL library."
HOMEPAGE = "https://pyopenssl.org/"
AUTHOR = "The pyOpenSSL developers <cryptography-dev@python.org>"
LICENSE = "Apache-2.0"
LIC_FILES_CHKSUM = "file://LICENSE;md5=3b83ef96387f14655fc854ddc3c6bd57"

PYPI_PACKAGE = "pyOpenSSL"
SRC_URI[md5sum] = "8b560a85b1feec02ba4f4542dadecf07"
SRC_URI[sha256sum] = "841498b9bec61623b1b6c47ebbc02367c07d60e0e195f19790817f10cc8db0b7"

S = "${WORKDIR}/pyOpenSSL-23.1.1"

RDEPENDS:${PN} = "python3-cryptography"

inherit pypi pkgconfig setuptools3
