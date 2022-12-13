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
            realpath=$(realpath "$path" --relative-to="$PWD")
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

            
            path_changes["$path:$job_name"]="$realpath/* $realpath/**/*"
            for dependency in $dependencies; do
                path_changes["$path:$job_name"]="${path_changes[$path:$job_name]} ${path_changes[$dependency]}"
            done
            path_changes["$path:$job_name"]=$(echo "${path_changes[$path:$job_name]}" | tr ' ' '\n'| sort | uniq | tr '\n' ' ')

            if [ "${path_changes[$path:$job_name]}" != "${path_changes_old[$path:$job_name]}" ]; then
                path_changes_old["$path:$job_name"]="${path_changes[$path:$job_name]}"
                has_changes=true
            fi
        fi
    done <<< "$(cat .jobs.yml)"
    if [ "$has_changes" = false ]; then
        break
    fi
done

rm .gitlab-ci.yml || true
IFS=
while read line; do
    IFS=' '
    # if line begins with >
    if [[ $line == \>* ]]; then
        #remove >
        line=$(echo "$line" | cut -c 2-)
        #trim whitespace
        line=$(echo "$line" | xargs)
        #split line on <
        path_job=$(echo "$line" | cut -d'<' -f1)
        path=$(echo "$path_job" | cut -d' ' -f1)
        realpath=$(realpath "$path" --relative-to="$PWD")
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
                #replace : with -
                dependency=$(echo "$dependency" | sed 's/:/-/g')
                echo "    - job: $dependency" >> .gitlab-ci.yml
                echo "      optional: true" >> .gitlab-ci.yml
                echo "      artifacts: false" >> .gitlab-ci.yml
            done
            echo "  dependencies: []" >> .gitlab-ci.yml
            echo "  before_script:" >> .gitlab-ci.yml
            echo "    - apt update && apt install -y unzip" >> .gitlab-ci.yml
            for dependency in $dependencies; do
                dependency=$(echo "$dependency" | sed 's/:/-/g')
                echo '    - curl --location --output artifacts.zip "$CI_SERVER_URL/api/v4/projects/$CI_PROJECT_ID/jobs/artifacts/main/download?job='"$dependency"'&job_token=$CI_JOB_TOKEN" && unzip artifacts.zip && rm artifacts.zip' >> .gitlab-ci.yml
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
    IFS=
done <<< "$(cat .jobs.yml)"