do_deploy:append() {
	echo "dtparam=spi=on" >> ${DEPLOYDIR}/bootfiles/config.txt
}
