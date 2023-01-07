#! /bin/sh
# See the discussion at https://stackoverflow.com/q/67724347/7976758

if [ -z "$1" ]; then
    echo "Usage $0 from_commit [to_commit]"
    exit 1
fi

if [ -z "$prog_dir" -o -z "$prog_name" ]; then
    start_dir="`pwd`"
    prog_dir="`dirname \"$0\"`"
    prog_name="`basename \"$0\"`"
    cd "$prog_dir"
    # Get full path
    prog_dir="`pwd`"
    cd "$start_dir"
    export prog_dir prog_name
fi

from_commit="$1"
to_commit="${2:-HEAD}"
export from_commit to_commit

if [ ! $(git diff "$from_commit" "$to_commit" --name-only | wc -l) -gt 0 ]; then
    exit
fi

# In the superproject
realpath $(git --no-pager diff --name-only "$from_commit" "$to_commit") || true

git submodule foreach -q '
    # In submodule "$name"
    prev_commit=`(git -C "$toplevel" ls-tree "$from_commit" "$sm_path" | awk "{print \\$3}")`
    curr_commit=`(git -C "$toplevel" ls-tree "$to_commit" "$sm_path" | awk "{print \\$3}")`
    if [ "$to_commit" = "HEAD" ]; then
        curr_commit=`git -C "$toplevel" submodule status "$sm_path" | awk "{print \$1}" | sed 's/+//'`
    else
        curr_commit=`(git -C "$toplevel" ls-tree "$to_commit" "$sm_path" | awk "{print \\$3}")`
    fi
    "$prog_dir/$prog_name" $prev_commit $curr_commit
'