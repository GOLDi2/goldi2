FILESEXTRAPATHS_prepend := "${THISDIR}/files:${PKI_PATH}:"
SRC_URI_append := "  \
	file://system.conf \
	file://ca.cert.pem \
"

do_install_append () {
    sed -i 's/@@MACHINE@@/${MACHINE}/' ${D}${sysconfdir}/rauc/system.conf
}