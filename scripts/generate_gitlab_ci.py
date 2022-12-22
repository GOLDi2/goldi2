#!/usr/bin/env python3

import re
import subprocess
import sys


with open(".jobs.yml", "r") as f:
    lines=f.readlines()

# If the --static flag is passed, create a static .gitlab-ci.yml that builds all jobs
DYNAMIC=False if "--static" in sys.argv else True

last_commit=subprocess.run(["git", "rev-parse", "HEAD~1"], capture_output=True).stdout.decode("utf-8").strip()
this_commit=subprocess.run(["git", "rev-parse", "HEAD"], capture_output=True).stdout.decode("utf-8").strip()

for arg in sys.argv:
    if arg.startswith("--last-commit="):
        last_commit=arg.split("=")[1]
    elif arg.startswith("--this-commit="):
        this_commit=arg.split("=")[1]

jobs=[]

def checkPathChange(path: str):
    """ Check if there are any file changes in the last git commit for the given path. """
    realpath=subprocess.run(["realpath", path], capture_output=True).stdout.decode("utf-8").strip()
    crosslabPath=subprocess.run(["realpath", "crosslab"], capture_output=True).stdout.decode("utf-8").strip()

    if realpath.startswith(crosslabPath):
        print(" ".join(["git", "ls-tree", last_commit, crosslabPath]))
        print(subprocess.run(["git", "ls-tree", last_commit, crosslabPath], capture_output=True))
        print(" ".join(["git", "ls-tree", this_commit, crosslabPath]))
        last_submodule_commit=subprocess.run(["git", "ls-tree", last_commit, crosslabPath], capture_output=True).stdout.decode("utf-8").strip().replace("\t", " ").split(" ")[2]
        this_submodule_commit=subprocess.run(["git", "ls-tree", this_commit, crosslabPath], capture_output=True).stdout.decode("utf-8").strip().replace("\t", " ").split(" ")[2]
        print(last_commit, this_commit, last_submodule_commit, this_submodule_commit)
        result=subprocess.run(["git", "diff", "--quiet", last_submodule_commit, this_submodule_commit, "--", realpath], capture_output=True, cwd=crosslabPath).returncode != 0
        print("Checking submodule changes for "+path+" ("+last_submodule_commit+" to "+this_submodule_commit+") -> "+str(result) )
        return result
    else:
        result=subprocess.run(["git", "diff", "--quiet", last_commit, this_commit, "--", realpath], capture_output=True).returncode != 0
        print("Checking changes for "+path+" ("+last_commit+" to "+this_commit+") -> "+str(result))
        return result

for line in lines:
    if line.startswith(">"):
        [job, _, dependencies] = re.match(r"^>([^<>]*)(<([^<>]*))?$", line).groups()
        job=job.strip()
        dependencies=(dependencies or "").strip()
        dependencies=dependencies.split(" ") if dependencies else []
        dependencies=[d.replace(":", " ", 1) for d in dependencies]
        changed=checkPathChange(job.split(" ")[0])
        
        jobs.append((job, dependencies, changed))
        print("Detected job:", job)

def hasChangedDependencies(job):
    for dependency in job[1]:
        dependencyJobs=[j for j in jobs if j[0]==dependency]
        if len(dependencyJobs)>0:
            dependencyJob=dependencyJobs.pop()
            if dependencyJob[2] or hasChangedDependencies(dependencyJob):
                return True
    return False

def formatJob(job, dependencies, changed):
    dependencies_formatted=" []"
    if len(dependencies):
        dependencies_formatted="\n"
        for dependency in dependencies:
            if DYNAMIC and len([jobs for jobs in jobs if jobs[0]==dependency and jobs[2]])==0:
                continue
            dependencies_formatted+=f"""    - job: {dependency.replace(" ","-")}
      optional: true
      artifacts: true
"""
    if DYNAMIC and not changed:
        return ""
    return f"""{job.replace(" ", "-")}:
  extends: .{job.split(" ")[1]}
  variables:
    PROJECT_DIR: {job.split(" ")[0]}
  needs:{dependencies_formatted}
"""

jobs=[[job[0], job[1], job[2] or hasChangedDependencies(job)] for job in jobs]

with (open("generated.gitlab-ci.yml", "w")) as f:
    with(open("static.gitlab-ci.yml", "r")) as f2:
        f.write(f2.read())
    f.write("\n")
    for job in jobs:
        f.write(formatJob(*job))

#print(lines)