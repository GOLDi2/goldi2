
SUMMARY = "Pythonic bindings for FFmpeg's libraries."
HOMEPAGE = "https://github.com/PyAV-Org/PyAV"
AUTHOR = "Mike Boers <pyav@mikeboers.com>"
LICENSE = "BSD-3-Clause"
LIC_FILES_CHKSUM = "file://LICENSE.txt;md5=a9c4cea4308c4521674ecd7c3255d8af"

PYPI_PACKAGE = "av"
SRC_URI[md5sum] = "b4ddb6692fb16afc34b6b53fd750bd62"
SRC_URI[sha256sum] = "8afd3d5610e1086f3b2d8389d66672ea78624516912c93612de64dcaa4c67e05"

S = "${WORKDIR}/av-10.0.0"

RDEPENDS:${PN} = ""
DEPENDS = "python3-cython-native ffmpeg"

inherit pypi pkgconfig setuptools3
