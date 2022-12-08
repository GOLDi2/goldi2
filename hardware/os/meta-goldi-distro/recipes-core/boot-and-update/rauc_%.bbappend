FILESEXTRAPATHS:prepend := "${THISDIR}/files:${CODE_SIGNING_CERT}:"
SRC_URI:append := "  \
	file://system.conf \
	file://ca.cert.pem \
"