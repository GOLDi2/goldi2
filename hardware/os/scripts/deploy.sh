#!/bin/bash

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
cd $SCRIPT_DIR/..

. $SCRIPT_DIR/select_board.sh

echo -e "#!/bin/bash\nsshpass -p $PASSWORD ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "'$@' > $SCRIPT_DIR/_ssh
chmod +x $SCRIPT_DIR/_ssh

kas shell $VARIANT.yml -c "devtool build $1"
kas shell $VARIANT.yml -c "devtool deploy-target -e $SCRIPT_DIR/_ssh $1 root@${IP}"

rm $SCRIPT_DIR/_ssh