#!/bin/bash

find src/ -name *.ts | while read FIL; do
  BASE="$(basename $FIL .ts)"
  [ "$BASE" == "webextension-polyfill" ] && continue
  [ "$BASE" == "facebook" ] && continue
  [ "$BASE" == "twitter" ] && continue
  DIR="$(dirname $FIL)"
  ADD_DIR=""
  LOG=
  while [[ true ]]; do 
    ADD_DIR="$(basename $DIR)"
    DIR="$(dirname $DIR)"
    [ "$ADD_DIR" == "src" ] && break
    [ "$ADD_DIR" == "." ] && break
    [ -z "$ADD_DIR" ] && break
    LOG="$ADD_DIR:$LOG"
  done
  LINE1="export {}"
  LINE2="const log = require('debug')('mbfc:$LOG$BASE');"
  grep -qE '^const log' $FIL && sed '1,/const log *=.*/ d' -i $FIL 
  sed "1 i $LINE2" -i $FIL
  sed "1 i $LINE1" -i $FIL
  # echo "Updated $FIL"; break
done
