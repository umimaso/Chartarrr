#!/bin/bash

NAME=chartarrr
BUILD=build
mkdir -p $BUILD

# Firefox build
BUILD_FIREFOX=$BUILD/firefox
rm -rf $BUILD_FIREFOX
mkdir -p $BUILD_FIREFOX
cp -r src/. $BUILD_FIREFOX
cp LICENSE.txt $BUILD_FIREFOX
rm -f $BUILD_FIREFOX/manifest-chromium.json
VERSION=$(cat $BUILD_FIREFOX/manifest.json | jq -r '.version')
(cd $BUILD_FIREFOX && zip -q -r -FS ../${NAME}_"${VERSION}".firefox.xpi ./)

# Chromium build
BUILD_CHROMIUM=$BUILD/chromium
rm -rf $BUILD_CHROMIUM
mkdir -p $BUILD_CHROMIUM
cp -r src/. $BUILD_CHROMIUM
cp LICENSE.txt $BUILD_CHROMIUM
mv -f $BUILD_CHROMIUM/manifest-chromium.json $BUILD_CHROMIUM/manifest.json
VERSION=$(cat $BUILD_CHROMIUM/manifest.json | jq -r '.version')
(cd $BUILD_CHROMIUM && zip -q -r -FS ../${NAME}_"${VERSION}".chromium.zip ./)
