SUMMARY = "GOLDi production image"

LICENSE = "MIT"

IMAGE_FEATURES = "ssh-server-dropbear tools-debug debug-tweaks"

IMAGE_INSTALL_append = " gstreamer1.0 gstreamer1.0-plugins-base gstreamer1.0-plugins-good gstreamer1.0-plugins-bad goldi-node-webrtc"

inherit core-image