DESCRIPTION = "Package that provides access to GPIO and other IO\
functions on the Broadcom BCM 2835 chip, allowing access to the\
GPIO pins on the 26 pin IDE plug on the RPi board"
SECTION = "base"
HOMEPAGE = "http://www.open.com.au/mikem/bcm2835"
AUTHOR = "Mike McCauley (mikem@open.com.au)"

LICENSE = "GPLv2"
LIC_FILES_CHKSUM = "file://COPYING;md5=e49f4652534af377a713df3d9dec60cb"

COMPATIBLE_MACHINE = "^rpi$"

SRC_URI = "http://www.airspayce.com/mikem/bcm2835/bcm2835-1.71.tar.gz"

SRC_URI[md5sum] = "9bd2d39bf4b3a9e81dce799ca51c826a"
SRC_URI[sha256sum] = "564920d205977d7e2846e434947708455d468d3a952feca9faef643abd03a227"

inherit autotools

PACKAGES += "${PN}-tests"

RDEPENDS:${PN}-dev = ""

FILES:${PN} = ""
FILES:${PN}-tests = "${libdir}/${BPN}"
FILES:${PN}-dbg += "${libdir}/${BPN}/.debug"
