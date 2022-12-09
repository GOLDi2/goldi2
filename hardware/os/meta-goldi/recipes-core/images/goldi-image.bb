SUMMARY = "GOLDi production image"

LICENSE = "MIT"

IMAGE_FEATURES = " read-only-rootfs"

IMAGE_INSTALL:append = " fpga-firmware"

inherit core-image


ROOTFS_POSTPROCESS_COMMAND += "copy_shadow_to_data;"

copy_shadow_to_data(){
    cp ${IMAGE_ROOTFS}/etc/shadow ${IMAGE_ROOTFS}/data-factory/shadow
}