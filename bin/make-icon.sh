#!/usr/bin/env bash

set -ex

# Check if all required parameters are provided
if [ "$#" -ne 4 ]; then
	echo "Usage: $0 TEXT BACKGROUND_COLOR FOREGROUND_COLOR FILENAME" >&2
	exit 1
fi

# Assign parameters to variables
TEXT="$1"
BACKGROUND_COLOR="$2"
FOREGROUND_COLOR="$3"
FILENAME="$4"

FONT="/nix/store/zzd0ra6z9sl0l25rmlpr8i6kdm54ygab-dejavu-fonts-2.37/share/fonts/truetype/DejaVuSans.ttf"

# Generate the icon
convert -size 19x19 xc:"$BACKGROUND_COLOR" /tmp/background.png
convert /tmp/background.png -gravity Center -pointsize 14 -font "$FONT" -fill "$FOREGROUND_COLOR" -annotate +0+0 "$TEXT" "$FILENAME.png"

convert -size 19x19 xc:"$FOREGROUND_COLOR" /tmp/background.png
convert /tmp/background.png -gravity Center -pointsize 14 -font "$FONT" -fill "$BACKGROUND_COLOR" -annotate +0+0 "$TEXT" "$FILENAME-invert.png"
