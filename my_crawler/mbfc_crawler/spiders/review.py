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


class ReviewSpider(ParseMbfc):
    name = 'review'
    todo = []
    limit = [] # ['https://mediabiasfactcheck.com/msnbc/']

    def launch(self, key, item):
        item = MbfcCrawlerItem(item)
        self.shelf[key] = dict(item)
        request = scrapy.Request(item["url"], callback=self.parse_details, errback=self.errorback, dont_filter=True)
        request.meta['bias'] = item['bias']
        request.meta['item'] = item
        self.logger.info('Starting review of: %s', item['url'])
        return request

    def start_requests(self):
        for key in self.shelf:
            item = self.shelf[key]

            try:
                if item['review']:
                    if len(self.limit) > 0 and not key in self.limit:
                        continue
                    yield self.launch(key, item)
            except KeyError:
                if 'url' in item:
                    yield self.launch(key, item)
