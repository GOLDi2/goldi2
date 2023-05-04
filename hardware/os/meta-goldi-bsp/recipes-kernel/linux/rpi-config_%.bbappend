do_deploy:append() {
	case ${MACHINE} in
		"goldi1")
			echo "dtoverlay=goldi1" >> ${DEPLOYDIR}/bootfiles/config.txt
			;;
	esac
}
