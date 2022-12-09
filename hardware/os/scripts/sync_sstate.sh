CLEAN=false

while [[ $# -gt 0 ]]; do
  key="$1"

  case $key in
    -c|--clean)
      CLEAN=true
      shift # past argument
      ;;  

    *) # unknown option
      shift # past argument
    ;;
  esac
done

if [ "$CLEAN" = true ] ; then
  rsync -e "ssh -o StrictHostKeyChecking=no" --rsync-path 'sudo rsync' -avP --info=progress2 --chmod=755 --delete build/sstate-cache/ admin@x56.theoinf.tu-ilmenau.de:/data/www/x56/share/sstate
else
  rsync -e "ssh -o StrictHostKeyChecking=no" --rsync-path 'sudo rsync' -avP --info=progress2 --chmod=755 build/sstate-cache/ admin@x56.theoinf.tu-ilmenau.de:/data/www/x56/share/sstate
fi