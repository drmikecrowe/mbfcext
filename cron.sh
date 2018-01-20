#!/bin/bash -ex

cd /home/mcrowe/Programming/Personal/show_media_bias/
source venv/bin/activate

cd /home/mcrowe/Programming/Personal/show_media_bias/my_crawler/mbfc_crawler
scrapy crawl getsource
cd /home/mcrowe/Programming/Personal/show_media_bias/process
rm -f valid.export
python get-rank.py
python extract.py
rm -f valid.export
if [ -f valid.export ]; then
    cp *.json ../docs/revised
    cd ..
    git commit -a -m"Automated update"
    git push
fi
