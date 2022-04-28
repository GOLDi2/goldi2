
SUMMARY = "Pythonic bindings for FFmpeg's libraries."
HOMEPAGE = "https://github.com/PyAV-Org/PyAV"
AUTHOR = "Mike Boers <pyav@mikeboers.com>"
LICENSE = "BSD"
LIC_FILES_CHKSUM = "file://LICENSE.txt;md5=a9c4cea4308c4521674ecd7c3255d8af"

SRC_URI = "https://files.pythonhosted.org/packages/56/e9/8928607b46177d907deeb8a10f40156afab401b7120e63662f392074475b/av-9.2.0.tar.gz"
SRC_URI[md5sum] = "d6e6ba383bf4d49b50e90cfb3bc04680"
SRC_URI[sha256sum] = "f2a7c226724d7f7745b376b459c500d9d17bd8d0473b7ea6bf8ddb4f7957c69d"

S = "${WORKDIR}/av-9.2.0"

RDEPENDS:${PN} = ""
DEPENDS = "python3-cython-native ffmpeg"

inherit setuptools3
