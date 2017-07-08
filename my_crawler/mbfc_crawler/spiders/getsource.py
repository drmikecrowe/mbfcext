# -*- coding: utf-8 -*-
import scrapy
import json
from urlparse import urlparse
import os
from unidecode import unidecode
import shelve
from parse_mbfc import ParseMbfc

try:
    from mbfc_crawler.items import MbfcCrawlerItem
except ImportError:
    from items import MbfcCrawlerItem


class GetsourceSpider(ParseMbfc):
    name = 'getsource'

    def start_requests(self):
        if os.path.exists("biases.json"):
            js = json.load(open('biases.json', 'r'))
        else:
            js = json.load(open('../biases.json', 'r'))
        for bias in js:
            self.logger.info("Crawling: %s", js[bias]["url"])
            request = scrapy.Request(js[bias]["url"], callback=self.parse, errback=self.errorback, dont_filter=True)
            request.meta['bias'] = bias
            yield request
