include update-bundle.inc
RAUC_BUNDLE_SLOTS += "bootfs"

RAUC_SLOT_bootfs ?= "boot-partition"
RAUC_SLOT_bootfs[type] = "image"
RAUC_SLOT_bootfs[fstype] = "tar"