#!/bin/bash
set -e

SCRIPT_DIR=$(dirname "$0")

# Default values
BRANCH=$(git rev-parse --abbrev-ref HEAD)
REPOSITORY=admin@x56.theoinf.tu-ilmenau.de:/data/www/x56/artifacts
JOB=""
files=$($SCRIPT_DIR/helper/find_files.sh '*/dist')
CLEAN=false
INCREMENTAL=false
RUN_ALL=false

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
YELLOW='\033[0;33m'
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

job_name_query='\(.path):\(.script | split(" ")[0])'
dependencies_query='\(.dependencies)'
path_query='\(.path)'
paths_query='\(.paths)'
script_query='\(.script | split(" ")[0])'
script_args_query='\(.script | split(" ")[1:] | join(" "))'

query="$job_name_query\t$dependencies_query\t$path_query\t$paths_query\t$script_query\t$script_args_query"

raw_jobs=$(cat .jobs.yml | yq -r '. | to_entries | .[] | .key as $k | .value | map({path: $k}+.) | .[] | "'"$query"'\t"')

oldIFS="$IFS"
IFS=$'\n'
for raw_job in $raw_jobs; do
  job_name=$(echo $raw_job | cut -f1)
  job_names+=($job_name)

  d=$(echo $raw_job | cut -f2)
  d=${d/[\"/}
  d=${d/\"]/}
  d=${d//\",\"/$'\n'}
  d=${d/null/}
  dependencies[$job_name]=$d

  status[$job_name]="created"

  path=$(echo $raw_job | cut -f3)
  paths=$(echo $raw_job | cut -f4)
  paths=${paths/[\"/}
  paths=${paths/\"]/}
  paths=${paths//\",\"/$'\n'}
  paths=${paths/null/}
  if [ -n "$paths" ]; then
    files[$job_name]=$(echo $paths | sed "s#\.\/#$path\/#g")
  else
    files[$job_name]=$path
  fi

  root[$job_name]=$path
  script[$job_name]=$(echo $raw_job | cut -f5)
  script_args[$job_name]=$(echo $raw_job | cut -f6)
done
IFS=$oldIFS

echo -e "${CSI}77GDone"

skipped_jobs=""
ignored_jobs=""
failed_jobs=""

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
      # check if runable (dependencies are build)
      for dependency in ${dependencies[$job]}; do
        if [[ $dependency == "null" ]]; then
          continue
        fi

        if [ -z ${status[$dependency]} ]; then
          echo ${dependencies[$job]}
          echo "Error: dependency $dependency of $job not found"
          exit 1
        fi

        if [ ${status[$dependency]} = "failed" ]; then
          status[$job]="failed"
          ignored_jobs="$ignored_jobs $job"
          runable=false
        elif [ ${status[$dependency]} = "created" ]; then
          runable=false
        #elif [ ${status[$dependency]} = "success" ]; then
        fi
      done

      if [ $runable = true ]; then
        echo -en "${BLUE}❯ Running $job"

        # Calculate input hash
        job_input_paths="-p ${files[$job]}"
        for dependency in ${dependencies[$job]}; do
          if [ $dependency = "null" ]; then
            continue
          fi
          job_input_paths="$job_input_paths -p ${root[$dependency]}/dist/${script[$dependency]}.hash"
        done
        job_input_hash=$($SCRIPT_DIR/helper/path_hash.sh $job_input_paths)

        if [ $RUN_ALL = false ]; then
          # Check if job is already build
          if [ ! -e ${root[$job]}/dist/${script[$job]}.hash ]; then
            # No hash file, so job is not build try to download cache
            echo -en "${CSI}62G${BLUE}⇣ downloading cache${NC}"
            $SCRIPT_DIR/download_job_artifact.sh --directory ${root[$job]}/dist --hash $job_input_hash -q || true
            echo -en "${CSI}62G                   ${NC}"
          fi
          # Check if job hash is the same
          if [ "$(cat ${root[$job]}/dist/${script[$job]}.hash 2>/dev/null)" = "$job_input_hash" ]; then
            skipped_jobs="$skipped_jobs $job"
            if [ "$(cat ${root[$job]}/dist/${script[$job]}.status 2>/dev/null)" = "success" ]; then
              status[$job]="success"
              echo -e "${CSI}72G${GREEN}✓ skipped${NC}"
            else
              status[$job]="failed"
              failed_jobs="$failed_jobs $job"
              echo -e "${CSI}72G${RED}✗ skipped${NC}"
            fi
            continue 2
          fi
        fi

        mkdir -p ${root[$job]}"/dist"
        rm -f ${root[$job]}"/dist/${script[$job]}.badge.svg"
        set +e
        (cd ${root[$job]} && ./scripts/${script[$job]}.sh ${script_args[$job]} > "dist/"${script[$job]}".log" 2>&1); exit_code=$?
        set -e
        if [ $exit_code -eq 0 ]; then
          status[$job]="success"
          echo -e "${CSI}80G${GREEN}✓${NC}"
        else
          status[$job]="failed"
          echo -e "${CSI}80G${RED}✗${NC}"
          failed_jobs="$failed_jobs $job"
        fi

        if [ ! -e ${root[$job]}/dist/${script[$job]}.badge.svg ]; then
          $SCRIPT_DIR/helper/create_badge.sh -j $job
        fi

        echo "${status[$job]}" > "${root[$job]}/dist/${script[$job]}.status"
        echo "$job_input_hash" > "${root[$job]}/dist/${script[$job]}.hash"
        continue 2
      fi
    fi
  done
  break
done

echo ""
echo -en "${BLUE}❯ Uploading artifacts${NC}"
set +e
$SCRIPT_DIR/helper/upload_artifacts.sh -q; exit_code=$?
set -e
if [ $exit_code -eq 0 ]; then
  echo -e "${CSI}77G${GREEN}Done${NC}"
else
  echo -e "${CSI}75G${RED}Failed${NC}"
fi
echo ""

if [ -n "$ignored_jobs" ]; then
  echo -e "${YELLOW}$(wc -w <<< $ignored_jobs) jobs didn't run because their dependencies failed:"
  for job in $ignored_jobs; do
    echo -e "${YELLOW}  $job"
  done
  echo ""
fi

if [ -n "$failed_jobs" ]; then
  echo -e "${RED}$(wc -w <<< $failed_jobs) jobs failed:"
  for job in $failed_jobs; do
    echo -e "${RED}  $job"
  done
  echo ""
fi

if [ -n "$skipped_jobs" ]; then
  echo -e "${NC}$(wc -w <<< $skipped_jobs) jobs were skipped"
  echo ""
fi

if [ -z "$failed_jobs" ]; then
  echo -e "${GREEN}All jobs succeeded${NC}"
  exit 0
fi

exit 1