#!/bin/sh
VERSION=$1
sed -i .old "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" manifest.json
mkdir -p dist
zip -r "dist/just-not-sorry-chrome.zip" . -i@include.lst
