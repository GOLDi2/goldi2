#!/bin/bash

set -e
set -o noglob

declare -A path_changes
declare -A path_changes_old

while :
do
    has_changes=false
    while read line; do
        # if line begins with >
        if [[ $line == \>* ]]; then
            #remove >
            line=$(echo "$line" | cut -c 2-)
            #trim whitespace
            line=$(echo "$line" | xargs)
            #split line on <
            path_job=$(echo "$line" | cut -d'<' -f1)
            path=$(echo "$path_job" | cut -d' ' -f1)
            job=$(echo "$path_job" | cut -d' ' -f2)
            #remove brackets from job
            job_name=$(echo "$job" | cut -d'(' -f1)
            #replace brackets with dashes
            template_job=$(echo "$job" | sed 's/(/-/g' | sed 's/)//g')
            #if line contains <
            if [[ $line == *\<* ]]; then
                dependencies=$(echo "$line" | cut -d'<' -f2)
            else
                dependencies=""
            fi

            
            path_changes["$path:$job_name"]="$path/**"
            for dependency in $dependencies; do
                path_changes["$path:$job_name"]="${path_changes[$path:$job_name]} ${path_changes[$dependency]}"
            done
            path_changes["$path:$job_name"]=$(echo "${path_changes[$path:$job_name]}" | tr ' ' '\n'| sort | uniq)

            if [ "${path_changes[$path:$job_name]}" != "${path_changes_old[$path:$job_name]}" ]; then
                path_changes_old["$path:$job_name"]="${path_changes[$path:$job_name]}"
                has_changes=true
            fi

            echo "$path-$job_name: ${path_changes[$path:$job_name]}" 
        fi
    done <<< "$(cat .jobs.yml)"
    if [ "$has_changes" = false ]; then
        break
    fi
done

rm .gitlab-ci.yml || true

while read line; do
    # if line begins with >
    if [[ $line == \>* ]]; then
        #remove >
        line=$(echo "$line" | cut -c 2-)
        #trim whitespace
        line=$(echo "$line" | xargs)
        #split line on <
        path_job=$(echo "$line" | cut -d'<' -f1)
        path=$(echo "$path_job" | cut -d' ' -f1)
        job=$(echo "$path_job" | cut -d' ' -f2)
        #remove brackets from job
        job_name=$(echo "$job" | cut -d'(' -f1)
        #replace brackets with dashes
        template_job=$(echo "$job" | sed 's/(/-/g' | sed 's/)//g')
        #if line contains <
        if [[ $line == *\<* ]]; then
            dependencies=$(echo "$line" | cut -d'<' -f2)
        else
            dependencies=""
        fi

        echo "$path-$job_name:" >> .gitlab-ci.yml
        echo "  extends: .$template_job" >> .gitlab-ci.yml
        echo "  variables:" >> .gitlab-ci.yml
        echo "    PROJECT_DIR: $path" >> .gitlab-ci.yml
        if [ -n "$dependencies" ]; then
            echo "  needs:" >> .gitlab-ci.yml
            for dependency in $dependencies; do
                echo "    - $dependency" >> .gitlab-ci.yml
            done
            echo "  dependencies:" >> .gitlab-ci.yml
            for dependency in $dependencies; do
                echo "    - $dependency" >> .gitlab-ci.yml
            done
        else
            echo "  needs: []" >> .gitlab-ci.yml
            echo "  dependencies: []" >> .gitlab-ci.yml
        fi
        echo "  rules:" >> .gitlab-ci.yml
        echo "    - changes:" >> .gitlab-ci.yml
        for path in ${path_changes["$path:$job_name"]}; do
            echo "      - ${path}" >> .gitlab-ci.yml
        done

        echo "" >> .gitlab-ci.yml
        continue
    fi
    echo "$line" >> .gitlab-ci.yml
done <<< "$(cat .jobs.yml)"