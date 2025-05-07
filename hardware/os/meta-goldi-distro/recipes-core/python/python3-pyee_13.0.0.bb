
SUMMARY = "A port of node.js's EventEmitter to python."
HOMEPAGE = "https://github.com/jfhbrook/pyee"
AUTHOR = "Josh Holbrook <josh.holbrook@gmail.com>"
LICENSE = "MIT"
LIC_FILES_CHKSUM = "file://LICENSE;md5=b2b1cc8797dff32cec5d783148fceab5"

SRC_URI = "https://files.pythonhosted.org/packages/95/03/1fd98d5841cd7964a27d729ccf2199602fe05eb7a405c1462eb7277945ed/pyee-13.0.0.tar.gz"
SRC_URI[md5sum] = "0aadf62e858b72bc493f8d19171f1f6b"
SRC_URI[sha256sum] = "b391e3c5a434d1f5118a25615001dbc8f669cf410ab67d04c4d4e07c55481c37"

S = "${WORKDIR}/pyee-13.0.0"

RDEPENDS:${PN} = "python3-typing-extensions"

do_configure:prepend() {
    cat > ${S}/setup.py <<-EOF
from setuptools import setup

setup()
EOF
}

inherit setuptools3
