SUMMARY = "GOLDi production image"

LICENSE = "MIT"

IMAGE_FEATURES = " read-only-rootfs"

IMAGE_INSTALL:append = ""

EXTRA_USERS_PARAMS = "usermod -p ${ROOT_PASSWORD} root;"

inherit core-image extrausers