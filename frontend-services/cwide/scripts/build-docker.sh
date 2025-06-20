#!/bin/bash
set -e

SCRIPT_DIR=$(dirname "$0")

VERSION=0.0.0-dev.$(git rev-parse --short HEAD)
TAG=cwide:${VERSION}

# build docker image
docker build -t $TAG .
docker tag $TAG cwide:latest

# Save the container to a tar file
mkdir -p dist
docker save $TAG > ./dist/docker-image.tar