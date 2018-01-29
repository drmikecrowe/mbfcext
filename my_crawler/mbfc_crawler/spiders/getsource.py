# -*- coding: utf-8 -*-
import json
import os

import scrapy

from parse_mbfc import ParseMbfc

from Source import Source
from Source import create_or_update_source

from scrapy.spidermiddlewares.httperror import HttpError
from twisted.internet.error import DNSLookupError
from twisted.internet.error import TimeoutError, TCPTimedOutError

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
            request = scrapy.Request(js[bias]["url"], callback=self.parse, errback=self.serrorback, dont_filter=True)
            request.meta['bias'] = bias
            request.meta['self'] = self
            yield request

    def sget_domain(self, request):
        try:
            domain = request.meta['domain']
        except KeyError:
            domain = request.meta['item']['domain']
        return domain

    def serrorback(self, failure):
        flag = False

        if failure.check(HttpError):
            # these exceptions come from HttpError spider middleware
            # you can get the non-200 response
            response = failure.value.response
            request = response.request
            self.logger.error('HttpError on %s', response.url)

        elif failure.check(DNSLookupError):
            # this is the original request
            request = failure.request
            self.logger.error('DNSLookupError on %s', request.url)
            flag = True

        elif failure.check(TimeoutError, TCPTimedOutError):
            request = failure.request
            self.logger.error('TimeoutError on %s', request.url)
        else:
            self.logger.error(repr(failure))
            flag = True

        if flag:
            domain = self.get_domain(request)
            sources = Source.get_or_create(domain=domain)
            source = sources[0]
            source.error = True
            self.logger.error('URL Invalid, flagging: %s', response.request.url)
            self.complete(source)