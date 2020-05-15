#!/bin/sh
VERSION_NAME=$1
VERSION=$(echo "$VERSION_NAME" | sed 's/-beta//')
sed -i.old "s/\"version\": \".*\"/\"version\": \"$VERSION_NAME\"/" package.json
sed -i.old -e "s/\"version_name\": \".*\"/\"version_name\": \"$VERSION_NAME\"/" -e "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" manifest.json
npm run build
mkdir -p dist
cd build
zip -r "../dist/just-not-sorry-chrome.zip" . *
