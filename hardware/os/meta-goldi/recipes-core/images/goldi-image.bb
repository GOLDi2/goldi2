SUMMARY = "GOLDi production image"
LICENSE = "MIT"
export IMAGE_BASENAME = "${MACHINE_VARIANT}"

MULTIMACH_TARGET_SYS = "${MACHINE_VARIANT}-${PACKAGE_ARCH}${TARGET_VENDOR}-${TARGET_OS}"

IMAGE_FEATURES = "ssh-server-dropbear allow-root-login read-only-rootfs"

IMAGE_INSTALL:append = " fpga-firmware goldi-crosslab-service"

inherit core-image


ROOTFS_POSTPROCESS_COMMAND += "copy_shadow_to_data;"

copy_shadow_to_data(){
    cp ${IMAGE_ROOTFS}/etc/shadow ${IMAGE_ROOTFS}/data-factory/shadow
}