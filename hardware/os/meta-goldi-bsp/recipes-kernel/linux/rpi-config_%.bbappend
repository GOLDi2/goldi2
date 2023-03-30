do_deploy:append() {
	echo "dtoverlay=goldi1" >> ${DEPLOYDIR}/bootfiles/config.txt
}
