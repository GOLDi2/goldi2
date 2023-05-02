require goldi-image.bb
SUMMARY = "GOLDi development image"
export IMAGE_BASENAME = "${MACHINE_VARIANT}-dev"

IMAGE_FEATURES:remove = "read-only-rootfs"
IMAGE_FEATURES += "tools-debug debug-tweaks package-management"

IMAGE_INSTALL:append = " nano usbutils curl ldd binutils bash dtc nodejs-npm git rsync dev-setup util-linux"
