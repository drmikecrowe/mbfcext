#!/bin/bash -ex

cd /home/mcrowe/Programming/Personal/show_media_bias/my_crawler/mbfc_crawler
scrapy crawl getsource
cp shelf.dat ..
cd ..
python extract.py
if [ -f valid.export ]; then
    cp *.json ../docs
    cd ..
    git commit -a -m"Automated update"
    git push
fi
