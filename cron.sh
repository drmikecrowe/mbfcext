#!/bin/bash -e

cd /home/mcrowe/Programming/Personal/show_media_bias/
source venv/bin/activate
docker stop $(docker ps -aq)
docker-compose up -d

function log {
    echo " "
    echo " "
    echo " "
    echo "$@"
}

function crawl {
    cd /home/mcrowe/Programming/Personal/show_media_bias/my_crawler/mbfc_crawler
    scrapy crawl getsource
    cd /home/mcrowe/Programming/Personal/show_media_bias
    python news_crawler/run.py
}

function process {
    cd /home/mcrowe/Programming/Personal/show_media_bias/process
    rm -f valid.export
    echo "Getting rank of unranked items"
    python get-rank.py
    echo "Getting rank of unranked items"
    python extract.py
}

function debug {
    rm -f valid.export
    cd /home/mcrowe/Programming/Personal/show_media_bias
    jq -S . docs/revised/sources.json > /tmp/original.json
    jq -S . process/sources.json > /tmp/new.json
    exit 0
}

echo '[]' > /home/mcrowe/Programming/Personal/show_media_bias/my_crawler/review.json

log "Crawling all sites"
crawl
process

# comment out
#debug
# comment out

if [ -f valid.export ]; then
    cp *.json ../docs/revised
    cd ..
    git commit -a -m"Automated update"
    git push
fi
docker-compose down
