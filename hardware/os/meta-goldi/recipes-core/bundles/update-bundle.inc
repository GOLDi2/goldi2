inherit bundle

RAUC_BUNDLE_COMPATIBLE = "${MACHINE}"
RAUC_BUNDLE_SLOTS = "rootfs"
RAUC_BUNDLE_BUILD = "${COMMITNR}"
RAUC_BUNDLE_FORMAT = "verity"

RAUC_SLOT_rootfs[fstype] = "ext4"

RAUC_KEY_FILE = "${THISDIR}/../../../signing.key.pem"
RAUC_CERT_FILE = "${THISDIR}/../../../signing.crt.pem"

