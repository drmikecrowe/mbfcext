#!/usr/bin/env bash

pushd extension
VERSION=$(jq '.version' manifest.json -r)
if [ -f ../MBFCext.$VERSION.zip ]; then
    echo "That version (../MBFCext.$VERSION.zip) already exists"
    die
fi
zip ../../MBFCext.$VERSION.zip -r *
