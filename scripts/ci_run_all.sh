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

jobs=$(cat .jobs.yml | yq -r '. | to_entries | .[] | .key as $k | "\($k):\(.value[].script)"')
for job in $jobs; do
  dependencies[$job]=$(cat .jobs.yml | yq -r '."'${job%:*}'"[] | select(.script == "'${job#*:}'").dependencies[]?')
  status[$job]="created"
  files[$job]=${job%:*}
  root[$job]=${job%:*}
  script[$job]=${job#*:}
done

while true; do
  for job in $jobs; do
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
      force_rebuild=false
      for dependency in ${dependencies[$job]}; do
        if [ $dependency = "null" ]; then
          continue
        fi
        if [ ${status[$dependency]} = "failed" -a ${status[$dependency]} = "ignored" ]; then
          status[$job]="ignored"
          runable=false
        elif [ ${status[$dependency]} = "created" ]; then
          runable=false
        elif [ ${status[$dependency]} = "success" ]; then
          force_rebuild=true
        fi
      done
      if [ $runable = true ]; then
        echo -en "${BLUE}❯ Running $job"
        if [ $INCREMENTAL = true ] && [ $force_rebuild = false ]; then
          if ! $SCRIPT_DIR/helper/check_for_changes_between_commits.sh -f ${files[$job]} -c $REFERENCE; then
            status[$job]="skipped"
            echo -e "${CSI}74G${GREEN}skipped${NC}"
            continue
          fi
        fi

        mkdir -p ${root[$job]}"/dist"
        set +e
        (cd ${root[$job]} && ./scripts/${script[$job]}.sh > "dist/"${script[$job]}".log" 2>&1); exit_code=$?
        set -e
        if [ $exit_code -eq 0 ]; then
          status[$job]="success"
          echo -e "${CSI}80G${GREEN}✓${NC}"
        else
          status[$job]="failed"
          echo -e "${CSI}80G${RED}✗${NC}"
        fi
        continue 2
      fi
    fi
  done
  break
done