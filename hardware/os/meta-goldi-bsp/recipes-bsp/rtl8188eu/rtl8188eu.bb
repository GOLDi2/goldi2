DESCRIPTION = "Driver for Realtek USB wireless devices"
HOMEPAGE = "http://www.realtek.com/"
SECTION = "kernel/modules"
LICENSE = "GPL-2.0-only"

LIC_FILES_CHKSUM = "file://README.md;md5=add0fbd6d99ef2353adaef9c9cc796f4"

inherit module

SRCREV = "${AUTOREV}"
SRC_URI = "git://github.com/lwfinger/rtl8188eu.git;branch=v5.2.2.4;protocol=https"

S = "${WORKDIR}/git"

do_install() {
	install -d ${D}/lib/modules/${KERNEL_VERSION}/kernel/drivers/net/wireless
	install -m 0644 ${S}/8188eu.ko ${D}${base_libdir}/modules/${KERNEL_VERSION}/kernel/drivers/net/wireless
}

RPROVIDES:${PN} += "kernel-module-hello"
