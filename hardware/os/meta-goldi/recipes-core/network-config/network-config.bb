LICENSE = "MIT"
LIC_FILES_CHKSUM = "file://${COMMON_LICENSE_DIR}/MIT;md5=0835ade698e0bcf8506ecda2f7b4f302"

FILESEXTRAPATHS_prepend := "${THISDIR}/files:"
SRC_URI_append := "  \
    file://10-eth0.network \
"

FILES_${PN} += " \
    ${sysconfdir}/systemd/network/10-eth0.network \
"

do_install () {
    install -d ${D}${sysconfdir}/systemd/network/
    install -m 755 ${THISDIR}/files/10-eth0.network ${D}${sysconfdir}/systemd/network/10-eth0.network
}

