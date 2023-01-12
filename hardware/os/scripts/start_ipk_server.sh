#!/bin/sh

IP=169.254.79.79

kas shell io-board.yml -c "bitbake package-index"

cd ./build/tmp/deploy/ipk
npx --yes http-server -p 8004 -s
ID=$!

LOCAL_IP=$(ip route get ${IP} | head -1 | cut -d" " -f5)

package_feed=$(echo "src/gz all http://$LOCAL_IP:8004/all"$'\n'"src/gz uri-cortexa72-0 http://$LOCAL_IP:8004/cortexa72"$'\n'"src/gz goldi1 http://$LOCAL_IP:8004/goldi1"$'\n')

echo "$package_feed" | sshpass -p $PASSWORD ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null root@${IP} 'cat - > /etc/opkg/base-feeds.conf'

fg