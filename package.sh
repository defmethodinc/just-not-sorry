#!/bin/sh
VERSION=`grep '"version":' manifest.json | cut -d: -f 2 | tr -d "\"\,\ "`
zip -r "just-not-sorry-$VERSION.zip" . -i@include.lst -x lib/jasmine-2.3.4/*.js \
lib/jasmine-jquery.js
