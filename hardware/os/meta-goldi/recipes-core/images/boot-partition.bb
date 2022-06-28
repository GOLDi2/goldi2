SUMMARY = "Perform approximate equivalent of wic's bootimg-partition.py"
DESCRIPTION = "This image provides essential boot files."

LICENSE = "CLOSED"
LIC_FILES_CHKSUM=""

# list of files from $DEPLOY_DIR_IMAGE to place in boot partition.
IMAGE_BOOT_FILES ??= ""

inherit image-artifact-names

IMGDEPLOYDIR = "${DEPLOY_DIR_IMAGE}"

do_bootfs[cleandirs] += "${S}"
do_bootfs[depends] += "goldi-image:do_image"
fakeroot python do_bootfs() {
    import re
    from glob import glob
    import subprocess

    boot_files = d.getVar("IMAGE_BOOT_FILES")
    kernel_dir = d.getVar("DEPLOY_DIR_IMAGE")
    deploy_files = []
    for src_entry in re.findall(r'[\w;\-\./\*]+', boot_files):
        if ';' in src_entry:
            dst_entry = tuple(src_entry.split(';'))
            if not dst_entry[0] or not dst_entry[1]:
                raise WicError('Malformed boot file entry: %s' % src_entry)
        else:
            dst_entry = (src_entry, src_entry)
        deploy_files.append(dst_entry)

    install_files = [];
    for deploy_entry in deploy_files:
        src, dst = deploy_entry
        if '*' in src:
            # by default install files under their basename
            entry_name_fn = os.path.basename
            if dst != src:
                # unless a target name was given, then treat name
                # as a directory and append a basename
                entry_name_fn = lambda name: \
                                os.path.join(dst,
                                            os.path.basename(name))

            srcs = glob(os.path.join(kernel_dir, src))

            for entry in srcs:
                src = os.path.relpath(entry, kernel_dir)
                entry_dst_name = entry_name_fn(entry)
                install_files.append((src, entry_dst_name))
        else:
            install_files.append((src, dst))
    
    working_dir = d.getVar("S")
    for src,dst in install_files:
        subprocess.run("install -m 0644 -D %s %s" % (os.path.join(kernel_dir,src), os.path.join(working_dir,dst)), shell=True, check=True)
}
#
addtask do_bootfs after do_prepare_recipe_sysroot
#
fakeroot do_image() {
	tar -cf ${IMGDEPLOYDIR}/${IMAGE_NAME}${IMAGE_NAME_SUFFIX}.tar -C ${S} .
}

addtask do_image after do_bootfs

do_image_complete() {
	ln -s ${IMAGE_NAME}${IMAGE_NAME_SUFFIX}.tar ${IMGDEPLOYDIR}/${IMAGE_LINK_NAME}.tar
}
addtask do_image_complete after do_image before do_build