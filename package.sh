#!/bin/sh
zip -r just-not-sorry.zip . -i@include.lst -x lib/jasmine-2.3.4/*.js \
lib/jasmine-jquery.js
