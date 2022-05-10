do_deploy:append() {
	echo "dtoverlay=disable-bt" >> ${DEPLOYDIR}/bootfiles/config.txt
}
