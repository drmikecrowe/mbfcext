#!/bin/sh

sizes="48x1 128x1 1024x1"
source=${1:-logo.svg}
dst=${2:-.}
basename=${3:-App-Icon}
for s in $sizes;do
  size=${s%x*}
  scale=${s##*x}
  resize=$(bc <<< ${size}*${scale} )
  convert "$source" -resize ${resize}x${resize}     -unsharp 1x4 $dst/"${basename}-${size}x${size}@${scale}x.png"
done