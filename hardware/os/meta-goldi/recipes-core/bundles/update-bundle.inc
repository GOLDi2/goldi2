inherit bundle

RAUC_BUNDLE_COMPATIBLE = "${MACHINE}"
RAUC_BUNDLE_SLOTS = "rootfs"
RAUC_BUNDLE_BUILD = "${COMMITNR}"

RAUC_SLOT_rootfs[fstype] = "ext4"

RAUC_KEY_FILE = "${PKI_PATH}/ca.key.pem"
RAUC_CERT_FILE = "${PKI_PATH}/ca.cert.pem"
