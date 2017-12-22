#!/bin/bash -ex

cd /home/mcrowe/Programming/Personal/show_media_bias/my_crawler/mbfc_crawler
scrapy crawl getsource
cd /home/mcrowe/Programming/Personal/show_media_bias/process
rm -f valid.export
python get-rank.py
python extract.py
if [ -f valid.export ]; then
    cp *.json ../docs/revised
    cd ..
    git commit -a -m"Automated update"
    git push
fi
