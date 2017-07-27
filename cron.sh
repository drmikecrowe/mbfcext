#!/bin/bash -ex

cd /home/mcrowe/Programming/Personal/show_media_bias/my_crawler/mbfc_crawler
scrapy crawl getsource
python extract.py

