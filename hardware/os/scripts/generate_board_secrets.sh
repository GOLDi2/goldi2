#!/bin/bash

board_config=$(cat boards.yml)

IP=$(cat boards.yml | yq -r '.boards[-1].ip' | cut -d'.' -f4)
IP=$((IP+1))

WG_PRIVATE=$(wg genkey)
WG_PUBLIC=$(echo "$WG_PRIVATE" | wg pubkey)
PASSWORD=$(pwgen -1)

board_config=$(cat boards.yml | yq -Y '.boards += [{name: "NAME", variant: "VARIANT"}]')
board_config=$(echo "$board_config" | yq -Y '.boards[-1].ip = "10.79.0.'$IP'"')
board_config=$(echo "$board_config" | yq -Y '.boards[-1].vpnConfig.private = "'$WG_PRIVATE','$IP'"')
board_config=$(echo "$board_config" | yq -Y '.boards[-1].vpnConfig.public = "'$WG_PUBLIC','$IP'"')
board_config=$(echo "$board_config" | yq -Y '.boards[-1].password= "'$PASSWORD'"')

if diff boards.yml <(echo "$board_config") >/dev/null; then
    echo "No changes to boards.yml"
else
    echo "Detected configuration changes:"
    diff -u boards.yml <(echo "$board_config")

    # Ask for confirmation to update boards.yml
    if [[ $1 != "-y" ]]; then
        read -r -p "Do you want to update boards.yml? (y/n) " response
        if [[ $response =~ ^([yY])$ ]]; then
            echo "$board_config" > boards.yml
            echo "Updated boards.yml"
        else
            echo "Skipping update of boards.yml"
        fi
    else
        echo "$board_config" > boards.yml
        echo "Updated boards.yml"
    fi
fi