#!/bin/bash

read -p 'board-name: ' name

export name=$name
for input in $(find template -type f,l); do
    output="$name${input#template}"
    output=${output//'$name'/$name}
    # check if file already exists
    if [ -f $output ]; then
        # check if file is tracked by git
        if git ls-files --error-unmatch $output > /dev/null 2>&1; then
            # check if file is modified
            if git diff HEAD --quiet -- $output; then
                # check if file is file or symlink
                if [ -L $input ]; then
                    mkdir -p $(dirname $output)
                    rm $output
                    cp -P $input $output
                else
                    mkdir -p $(dirname $output)
                    envsubst '$name' < "$input" > "$output"
                fi
            else
                echo "File $output is modified. Skipping."
            fi
        else
            echo "File $output already exists but is not tracked by git. Skipping."
        fi
    else
        if [ -L $input ]; then
            mkdir -p $(dirname $output)
            cp -P $input $output
        else
            mkdir -p $(dirname $output)
            envsubst '$name' < "$input" > "$output"
        fi
    fi
done

for input in $(find ../sigasi/template -type f,l); do
    output="../sigasi/$name${input#../sigasi/template}"
    output=${output//'$name'/$name}
    # check if file already exists
    if [ -f $output ]; then
        # check if file is tracked by git
        if git ls-files --error-unmatch $output > /dev/null 2>&1; then
            # check if file is modified
            if git diff HEAD --quiet -- $output; then
                # check if file is file or symlink
                if [ -L $input ]; then
                    mkdir -p $(dirname $output)
                    rm $output
                    cp -P $input $output
                else
                    mkdir -p $(dirname $output)
                    envsubst '$name' < "$input" > "$output"
                fi
            else
                echo "File $output is modified. Skipping."
            fi
        else
            echo "File $output already exists but is not tracked by git. Skipping."
        fi
    else
        if [ -L $input ]; then
            mkdir -p $(dirname $output)
            cp -P $input $output
        else
            mkdir -p $(dirname $output)
            envsubst '$name' < "$input" > "$output"
        fi
    fi
done