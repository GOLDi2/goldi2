BUNDLE_BASENAME = "${MACHINE_VARIANT}-dev"

MULTIMACH_TARGET_SYS = "${MACHINE_VARIANT}-${PACKAGE_ARCH}${TARGET_VENDOR}-${TARGET_OS}"

RAUC_SLOT_rootfs = "goldi-dev-image"
RAUC_SLOT_rootfs[file] = "${MACHINE_VARIANT}-dev-${MACHINE}.ext4"
include update-bundle.inc