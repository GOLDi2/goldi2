SUMMARY = ""

LICENSE = "CLOSED"
LIC_FILES_CHKSUM=""

RDEPENDS:${PN} = "base-files"

do_install:append() {
    install -d ${D}/home/root
    ln -s /data/.vscode-server ${D}/home/root/.vscode-server
    
    install -d ${D}/data-factory/.vscode-server
}

FILES:${PN} = " \
    home/root/.vscode-server \
    data-factory/.vscode-server \
"

INHIBIT_PACKAGE_DEBUG_SPLIT = "1"