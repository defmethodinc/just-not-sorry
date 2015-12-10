#!/bin/sh
VERSION=`grep '"version":' manifest.json | cut -d: -f 2 | tr -d "\"\,\ "`
zip -r "just-not-sorry-$VERSION.zip" . -i@include.lst
