#!/bin/bash
set -e

SCRIPT_DIR=$(dirname "$0")

# Default values
BRANCH=$(git rev-parse --abbrev-ref HEAD)
REPOSITORY=admin@x56.theoinf.tu-ilmenau.de:/data/www/x56/artifacts
JOB=""
files=$($SCRIPT_DIR/.find-files.sh '*/dist')
CLEAN=false
INCREMENTAL=false
RUN_ALL=true

# Read the commands
while [[ $# -gt 0 ]]; do
  key="$1"

  case $key in
    -b|--branch)
      BRANCH="$2"
      shift # past argument
      shift # past value
      ;;

    -j|--job)
      JOB="$2"
      shift # past argument
      shift # past value
      ;;

    --script)
      if [ -z "$SCRIPT" ]; then
        SCRIPT="$2"
      else
        SCRIPT="$SCRIPT $2"
      fi
      shift # past argument
      shift # past value
      ;;

    -f|--files)
      files="$2"
      shift # past argument
      shift # past value
      ;;

    -c|--clean)
      CLEAN=true
      shift # past argument
      ;;

    -i|--incremental)
      INCREMENTAL=true
      shift # past argument
      ;;

    -r|--reference)
      REFERENCE="$2"
      INCREMENTAL=true
      shift # past argument
      shift # past value
      ;;

    *) # unknown option
      shift # past argument
    ;;
  esac
done

RED="\033[0;31m"
GREEN="\033[0;32m"
BLUE='\033[0;34m'
NC="\033[0m"
CSI="\033["

# load .jobs.yaml
declare -A dependencies
declare -A status
declare -A files
declare -A root
declare -A script
declare -A script_args
declare -a job_names

echo -en "Parsing .jobs.yml..."

raw_jobs=$(cat .jobs.yml | yq -r '. | to_entries | .[] | .key as $k | .value | map({path: $k}+.) | "\(.[])"')

oldIFS="$IFS"
IFS=$'\n'
for raw_job in $raw_jobs; do
  job_name=$(echo $raw_job | jq -r '.path + ":" + .script | split(" ")[0]')
  job_names+=($job_name)
  dependencies[$job_name]=$(echo $raw_job | jq -r '.dependencies[]?' | sed 's/^null$//g')
  status[$job_name]="created"

  path=$(echo $raw_job | jq -r '.path')
  paths=$(echo $raw_job | jq -r '.paths[]?')
  if [[ "$paths" != "" ]]; then
    files[$job_name]=$(echo $paths | sed "s#\.\/#$path\/#g")
  else
    files[$job_name]=$(echo $raw_job | jq -r '"\(.path)"')
  fi

  root[$job_name]=$(echo $raw_job | jq -r '"\(.path)"')
  script[$job_name]=$(echo $raw_job | jq -r '"\(.script | split(" ")[0])"')
  script_args[$job_name]=$(echo $raw_job | jq -r '"\(.script | split(" ")[1:] | join(" "))"')
done
IFS=$oldIFS

echo -e "${CSI}77GDone"

while true; do
  for job in "${job_names[@]}"; do

    # skip if script name is not in SCRIPT
    if [ ! -z "$SCRIPT" ]; then
      is_in_script=false
      for s in $SCRIPT; do
        if [ ${script[$job]} = $s ]; then
          is_in_script=true
          break
        fi
      done
      if [ $is_in_script = false ]; then
        status[$job]="skipped"
        continue
      fi
    fi

    if [ ${status[$job]} = "created" ]; then
      runable=true
      for dependency in ${dependencies[$job]}; do
        if [[ $dependency == "null" ]]; then
          continue
        fi

        if [ -z ${status[$dependency]} ]; then
          echo "Error: dependency $dependency of $job not found"
          exit 1
        fi

        if [ ${status[$dependency]} = "failed" -a ${status[$dependency]} = "ignored" ]; then
          status[$job]="ignored"
          runable=false
        elif [ ${status[$dependency]} = "created" ]; then
          runable=false
        #elif [ ${status[$dependency]} = "success" ]; then
        fi
      done
      if [ $runable = true ]; then
        echo -en "${BLUE}❯ Running $job"

        job_input_paths="-p ${files[$job]}"
        for dependency in ${dependencies[$job]}; do
          if [ $dependency = "null" ]; then
            continue
          fi
          job_input_paths="$job_input_paths -p ${root[$dependency]}/dist/${script[$dependency]}.hash"
        done
        job_input_hash=$($SCRIPT_DIR/helper/path_hash.sh $job_input_paths)

        if [ $RUN_ALL = false ]; then
          if [ "$(cat ${root[$job]}/dist/${script[$job]}.hash 2>/dev/null)" = "$job_input_hash" ]; then
            status[$job]="skipped"
            if [ "$(cat ${root[$job]}/dist/${script[$job]}.status 2>/dev/null)" = "success" ]; then
              echo -e "${CSI}72G${GREEN}✓ skipped${NC}"
            else
              echo -e "${CSI}72G${RED}✗ skipped${NC}"
            fi
            continue 2
          fi
        fi

        mkdir -p ${root[$job]}"/dist"
        set +e
        (cd ${root[$job]} && ./scripts/${script[$job]}.sh ${script_args[$job]} > "dist/"${script[$job]}".log" 2>&1); exit_code=$?
        set -e
        if [ $exit_code -eq 0 ]; then
          status[$job]="success"
          echo -e "${CSI}80G${GREEN}✓${NC}"
        else
          status[$job]="failed"
          echo -e "${CSI}80G${RED}✗${NC}"
        fi

        echo "${status[$job]}" > "${root[$job]}/dist/${script[$job]}.status"
        echo "$job_input_hash" > "${root[$job]}/dist/${script[$job]}.hash"
        continue 2
      fi
    fi
  done
  break
done