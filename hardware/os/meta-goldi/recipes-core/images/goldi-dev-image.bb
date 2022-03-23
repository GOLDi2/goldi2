SUMMARY = "GOLDi development image"

inherit core-image
require goldi-image.bb

IMAGE_FEATURES += "ssh-server-dropbear tools-debug debug-tweaks"

CORE_IMAGE_EXTRA_INSTALL += "goldi-packagegroup-testapps"

IMAGE_INSTALL:append = " nano usbutils curl ldd binutils bash"
