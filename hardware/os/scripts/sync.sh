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
  rsync -e "ssh -o StrictHostKeyChecking=no" --rsync-path 'sudo rsync' -a --chmod=755 --delete build/sstate-cache/ admin@x56.theoinf.tu-ilmenau.de:/data/www/x56/share/sstate
else
  rsync -e "ssh -o StrictHostKeyChecking=no" --rsync-path 'sudo rsync' -a --chmod=755 build/sstate-cache/ admin@x56.theoinf.tu-ilmenau.de:/data/www/x56/share/sstate
fi

if [ "$CLEAN" = true ] ; then
  rsync -e "ssh -o StrictHostKeyChecking=no" --rsync-path 'sudo rsync' -a --chmod=755 --delete build/tmp/deploy/ipk/ admin@x56.theoinf.tu-ilmenau.de:/data/www/package/ipk-dev
else
  rsync -e "ssh -o StrictHostKeyChecking=no" --rsync-path 'sudo rsync' -a --chmod=755 build/tmp/deploy/ipk/ admin@x56.theoinf.tu-ilmenau.de:/data/www/package/ipk-dev
fi
