#!/bin/bash

read -p 'Username: ' username
read -sp 'Password: ' password
echo

TOKEN=$(curl --silent --location \
--request POST 'https://api.goldi-labs.de/login' \
--header 'Content-Type: application/json' \
--header 'Accept: application/json' \
--data-raw '{
  "username": "'$username'",
  "password": "'$password'",
  "method": "tui"
}')

echo $TOKEN