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
    todo = ['https://mediabiasfactcheck.com/independent-journal-review/']
    limit = [] # ['https://mediabiasfactcheck.com/msnbc/']

    def launch(self, key, item):
        raise Exception("Needs rework")
        item = MbfcCrawlerItem(item)
        request = scrapy.Request(item.url, callback=self.parse_details, errback=self.errorback, dont_filter=True)
        request.meta['bias'] = item.bias
        request.meta['domain'] = item.domain
        self.logger.info('Starting review of: %s', item.url)
        return request

    def start_requests(self):
        for key in self.shelf:
            item = self.shelf[key]

            try:
                if item.review or self.todo.find(key) > -1:
                    if len(self.limit) > 0 and not key in self.limit:
                        continue
                    yield self.launch(key, item)
            except KeyError:
                if 'url' in item:
                    yield self.launch(key, item)
