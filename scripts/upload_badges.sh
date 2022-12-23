#!/bin/bash
set -e

SCRIPT_DIR=$(dirname "$0")

JOB_STATUS="failed"
if [ "$1" = "success" ]; then
    JOB_STATUS="success"
fi

badges=$($SCRIPT_DIR/.find-files.sh '*/badge_*.svg')
# remove tailing _success.svg, _failed.svg or .svg
badges=$(echo "$badges" | sed -e 's/_success.svg$//' -e 's/_failed.svg$//' -e 's/.svg$//')


mkdir -p badges
for badge in $badges; do
    name=$(basename $badge)
    cp "${badge}_${JOB_STATUS}.svg" "badges/${name}.svg" || cp "${badge}.svg" "badges/${name}.svg"
done

rsync -e "ssh -o StrictHostKeyChecking=no" --rsync-path 'sudo rsync' -avP --info=progress2 --chmod=755 -L badges/* admin@x56.theoinf.tu-ilmenau.de:/data/www/x56/badges/