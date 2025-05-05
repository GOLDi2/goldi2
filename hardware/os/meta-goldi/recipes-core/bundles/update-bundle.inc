inherit bundle

RAUC_BUNDLE_COMPATIBLE = "${MACHINE_VARIANT}-${MACHINE}"
RAUC_BUNDLE_SLOTS = "rootfs"
RAUC_BUNDLE_FORMAT = "verity"
RAUC_BUNDLE_VERSION = "${MACHINE_VERSION}"

RAUC_SLOT_rootfs[fstype] = "ext4"

RAUC_KEY_FILE = "${THISDIR}/../../../signing.key.pem"
RAUC_CERT_FILE = "${THISDIR}/../../../signing.crt.pem"

