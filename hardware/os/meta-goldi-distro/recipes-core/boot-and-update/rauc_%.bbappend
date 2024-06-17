FILESEXTRAPATHS:prepend := "${THISDIR}/files:${CODE_SIGNING_CERT}:"
SRC_URI:append := "  \
	file://system.conf \
	file://ca.cert.pem \
"

do_install:append() {
	sed -i 's/compatible=goldi1/compatible='"${MACHINE_VARIANT}-${MACHINE}"'/g' ${D}/etc/rauc/system.conf
}

PACKAGECONFIG[streaming] = "--enable-streaming,--enable-streaming=no,libnl"
PACKAGECONFIG ??= "service network streaming json nocreate gpt"