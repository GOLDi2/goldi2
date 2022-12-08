SUMMARY = "AVRDUDE - AVR Downloader/UploaDEr"
HOMEPAGE = "https://www.nongnu.org/avrdude/"
SECTION = "devel"
LICENSE = "GPLv2+"

LIC_FILES_CHKSUM = "file://COPYING;md5=4f51bb496ef8872ccff73f440f2464a8"

inherit autotools gettext

# Do we need libhid?
DEPENDS = " \
    bison-native \
    flex \
    elfutils \
    libusb1 \
    libftdi \
    hidapi \
"

SRC_URI = "git://github.com/avrdudes/avrdude.git;protocol=https;branch=main"
SRCREV = "7015ebe0d6b6087ed5dfaa20992bd055a4b009cc"
S = "${WORKDIR}/git"
PV = "6.4"

EXTRA_OECONF:append = " --enable-linuxgpio"

FILESEXTRAPATHS:prepend := "${THISDIR}/files:"
SRC_URI:append := "  \
    file://avrdude.conf \
"

do_install:append () {
    cat ${THISDIR}/files/avrdude.conf >> ${D}${sysconfdir}/avrdude.conf
}
