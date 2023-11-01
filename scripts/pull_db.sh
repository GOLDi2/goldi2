#!/bin/bash
VARIANT="prod"
USER="johannes"
DOMAIN="www.goldi-labs.de"

# Read the commands
while [[ $# -gt 0 ]]; do
  key="$1"

  case $key in
    --variant)
      VARIANT="$2"
      shift # past argument
      ;;
    --user)
      USER="$2"
      shift # past argument
      ;;
    --domain)
      DOMAIN="$2"
      shift # past argument
      shift # past value
      ;;
    --database)
      DATABASE="$2"
      shift # past argument
      shift # past value
      ;;
    --password)
      PASSWORD="$2"
      shift # past argument
      shift # past value
      ;;
  esac
done

######################################################################################################
ssh $USER@$DOMAIN "docker exec $VARIANT-db-1 sh -c 'exec mariadb-dump $([[ -n $DATABASE ]] && echo "$DATABASE" || echo "--all-databases") -uroot -p"$PASSWORD"'" > $([[ -n $DATABASE ]] && echo "$DATABASE" || echo "all").sql