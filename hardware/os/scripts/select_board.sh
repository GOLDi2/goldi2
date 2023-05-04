if [[ $1 == 'auto' ]] && ping -c1 -w1 169.254.79.79 >/dev/null 2>&1; then
    if ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null root@169.254.79.79 true; then
        echo "Board uninitialized"
        exit 1
    fi

    passwords=$(cat boards.yml | yq -r '.boards[].password')
    index=0
    for password in $passwords; do
        if sshpass -p $password ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null root@169.254.79.79 true 2>/dev/null; then
            INDEX=$index
            export IP=169.254.79.79
            break
        fi
        index=$((index+1))
    done
else
    boards=$(cat boards.yml | yq -r '.boards[].name')
    index=0
    for board in $boards; do
        echo "$index) $board"
        index=$((index+1))
    done
    read -p "Select board (0-$((index-1))): " INDEX

    if ping -c1 -w1 169.254.79.79 >/dev/null 2>&1; then
        export IP=169.254.79.79
    else
        export IP=$(cat boards.yml | yq -r '.boards['$INDEX'].ip')
    fi
fi

export PASSWORD=$(cat boards.yml | yq -r '.boards['$INDEX'].password')

if sshpass -p $PASSWORD ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null root@$IP true 2>/dev/null; then
    mac=$(sshpass -p $PASSWORD ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null root@$IP "cat /sys/class/net/eth0/address" 2>/dev/null);
    wifiMac=$(sshpass -p $PASSWORD ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null root@$IP "cat /sys/class/net/wlan0/address" 2>/dev/null);
    vpnConfig=$(sshpass -p $PASSWORD ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null root@$IP "cat /boot/vpn-config" 2>/dev/null);

    board_config=$(cat boards.yml)
    if [ -n "$mac" ]; then
        board_config=$(echo "$board_config" | yq -Y '.boards['$INDEX'].mac = "'$mac'"')
    fi
    if [ -n "$wifiMac" ]; then
        board_config=$(echo "$board_config" | yq -Y '.boards['$INDEX'].wifiMac = "'$wifiMac'"')
    fi
    if [ -n "$vpnConfig" ]; then
        board_config=$(echo "$board_config" | yq -Y '.boards['$INDEX'].vpnConfig.private = "'$vpnConfig'"')
    fi
    if diff boards.yml <(echo "$board_config") >/dev/null; then
        echo "No changes to boards.yml"
    else
        echo "Detected configuration changes:"
        diff boards.yml <(echo "$board_config")
        read -r -p "Do you want to update boards.yml? (y/n) " response
        if [[ $response =~ ^([yY])$ ]]; then
            echo "$board_config" > boards.yml
            echo "Updated boards.yml"
        fi
    fi
fi

export VPN_CONFIG=$(cat boards.yml | yq -r '.boards['$INDEX'].vpnConfig.private')

echo "Set IP to $IP"
echo "Set PASSWORD to $PASSWORD"
echo "Set VPN_CONFIG to $VPN_CONFIG"
