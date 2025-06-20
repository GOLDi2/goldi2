#!/bin/bash
set -e

SCRIPT_DIR=$(dirname "$0")

npm ci
npm run build