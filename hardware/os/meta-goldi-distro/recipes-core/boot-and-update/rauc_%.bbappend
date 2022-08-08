FILESEXTRAPATHS:prepend := "${THISDIR}/files:${CODE_SIGNING_CERT}:"
SRC_URI:append := "  \
	file://system.conf \
	file://ca.cert.pem \
"

do_install:append () {
    sed -i 's/@@MACHINE@@/${MACHINE}/' ${D}${sysconfdir}/rauc/system.conf
}