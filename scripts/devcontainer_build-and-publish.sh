#!/bin/bash
set -e

devcontainer build --workspace-folder ./ --image-name goldi2/devcontainer
docker push goldi2/devcontainer