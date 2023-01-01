#!/bin/bash
#
for f in *.png; do
  base=$(basename "$f" .png)
  var=${base//-/_}
  cat <<EOF
import $var from "~background/icons/$f"
EOF

done
