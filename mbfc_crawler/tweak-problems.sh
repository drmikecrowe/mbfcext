#!/bin/bash

SOURCE="output/sources-original.json"
DEST="output/sources.json"

mv $DEST $SOURCE
jq -S '.' $SOURCE | egrep '^  "'  | egrep '^  "[^"]*/' -A 1 -B 1 | egrep -o '".*"' | sed 's/"//g' | awk -f tweak-problems.awk > tweak-problems.sed
sed -f tweak-problems.sed $SOURCE > $DEST

