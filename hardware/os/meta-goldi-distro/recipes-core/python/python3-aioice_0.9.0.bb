
SUMMARY = "An implementation of Interactive Connectivity Establishment (RFC 5245)"
HOMEPAGE = "https://github.com/aiortc/aioice"
AUTHOR = "Jeremy Lainé <jeremy.laine@m4x.org>"
LICENSE = "BSD-3-Clause"
LIC_FILES_CHKSUM = "file://LICENSE;md5=f51a4013af37fa3764314e9b051513fd"

SRC_URI = "https://files.pythonhosted.org/packages/33/b6/e2b0e48ccb5b04fe29265e93f14a0915f416e359c897ae87d570566c430b/aioice-0.9.0.tar.gz"
SRC_URI[md5sum] = "da57c5e91272d4358774d7354d61a1cd"
SRC_URI[sha256sum] = "fc2401b1c4b6e19372eaaeaa28fd1bd9cbf6b0e412e48625297c53b495eebd1e"

S = "${WORKDIR}/aioice-0.9.0"

RDEPENDS:${PN} = "python3-dnspython python3-ifaddr"

inherit setuptools3
