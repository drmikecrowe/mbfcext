#!/bin/bash

jq -S '.' output/sources.json | egrep '^  "'  | egrep '^  "[^"]*/' -A 1 -B 1 | egrep -o '".*"' | sed 's/"//g' | awk -f show-problems.awk

