do_deploy_append() {
	echo "dtoverlay=disable-bt" >> ${DEPLOYDIR}/bootfiles/config.txt
}
