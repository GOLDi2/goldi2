#!/bin/bash
set -e

SCRIPT_DIR=$(dirname "$0")

rm -rf public/extensions

mkdir public/extensions

mkdir public/extensions/base
mkdir public/extensions/base/dist
cp -r extensions/base/src public/extensions/base/src
cp -r extensions/base/dist-web public/extensions/base/dist/web
cp extensions/base/package.json public/extensions/base

mkdir public/extensions/collaboration
mkdir public/extensions/collaboration/dist
cp -r extensions/collaboration/src public/extensions/collaboration/src
cp -r extensions/collaboration/dist-web public/extensions/collaboration/dist/web
cp extensions/collaboration/package.json public/extensions/collaboration

mkdir public/extensions/compilation
mkdir public/extensions/compilation/dist
cp -r extensions/compilation/src public/extensions/compilation/src
cp -r extensions/compilation/dist-web public/extensions/compilation/dist/web
cp extensions/compilation/package.json public/extensions/compilation

mkdir public/extensions/debugging
mkdir public/extensions/debugging/dist
cp -r extensions/debugging/src public/extensions/debugging/src
cp -r extensions/debugging/dist-web public/extensions/debugging/dist/web
cp extensions/debugging/package.json public/extensions/debugging

mkdir public/extensions/filesystem
mkdir public/extensions/filesystem/dist
cp -r extensions/filesystem/src public/extensions/filesystem/src
cp -r extensions/filesystem/dist-web public/extensions/filesystem/dist/web
cp extensions/filesystem/package.json public/extensions/filesystem

mkdir public/extensions/lsp
mkdir public/extensions/lsp/dist
cp -r extensions/lsp/src public/extensions/lsp/src
cp -r extensions/lsp/dist-web public/extensions/lsp/dist/web
cp extensions/lsp/package.json public/extensions/lsp

mkdir public/extensions/testing
mkdir public/extensions/testing/dist
cp -r extensions/testing/src public/extensions/testing/src
cp -r extensions/testing/dist-web public/extensions/testing/dist/web
cp extensions/testing/package.json public/extensions/testing