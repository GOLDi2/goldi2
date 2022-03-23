SUMMARY = "GOLDi production image"

LICENSE = "MIT"

IMAGE_FEATURES = "ssh-server-dropbear tools-debug debug-tweaks"

IMAGE_INSTALL:append = " gstreamer1.0 gstreamer1.0-plugins-base gstreamer1.0-plugins-good gstreamer1.0-plugins-bad"

inherit core-image