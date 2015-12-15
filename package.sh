#!/bin/sh
VERSION=`grep '"version":' ./package.json | cut -d: -f 2 | tr -d "\"\,\ "`
zip -r "./build/just-not-sorry-$VERSION.zip" . -i@include.lst
