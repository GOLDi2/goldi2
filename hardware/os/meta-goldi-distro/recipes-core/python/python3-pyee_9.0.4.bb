
SUMMARY = "A port of node.js's EventEmitter to python."
HOMEPAGE = "https://github.com/jfhbrook/pyee"
AUTHOR = "Josh Holbrook <josh.holbrook@gmail.com>"
LICENSE = "MIT"
LIC_FILES_CHKSUM = "file://LICENSE;md5=b2b1cc8797dff32cec5d783148fceab5"

SRC_URI = "https://files.pythonhosted.org/packages/99/d0/32803671d5d9dc032c766ad6c0716db98fa9b2c6ad9ec544f04849e9d3c7/pyee-9.0.4.tar.gz"
SRC_URI[md5sum] = "0a99bd1a88e290dfe5dbea8c34c8dda1"
SRC_URI[sha256sum] = "2770c4928abc721f46b705e6a72b0c59480c4a69c9a83ca0b00bb994f1ea4b32"

S = "${WORKDIR}/pyee-9.0.4"

RDEPENDS:${PN} = "python3-typing-extensions"

inherit setuptools3
