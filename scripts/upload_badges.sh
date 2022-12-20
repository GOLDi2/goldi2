#!/bin/bash
set -e

JOB_STATUS="failed"
if [ "$JOB_STATUS" = "success" ]; then
    JOB_STATUS="success"
fi

badges=$(find -L . -path '*/badge_*.svg' -o \( -name 'build' -o -name 'node_modules' -o -path './crosslab' -o -path './badges' \) -prune -false)
# remove tailing _success.svg, _failed.svg or .svg
badges=$(echo "$badges" | sed -e 's/_success.svg$//' -e 's/_failed.svg$//' -e 's/.svg$//')

mkdir -p badges
for badge in $badges; do
    name=$(basename $badge)
    cp "${badge}_${JOB_STATUS}.svg" "badges/${name}.svg" || cp "${badge}.svg" "badges/${name}.svg"
done

rsync -e "ssh -o StrictHostKeyChecking=no" --rsync-path 'sudo rsync' -avP --info=progress2 --chmod=755 -L badges/* admin@x56.theoinf.tu-ilmenau.de:/data/www/x56/badges/