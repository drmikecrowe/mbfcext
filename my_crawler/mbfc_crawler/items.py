# -*- coding: utf-8 -*-

# Define here the models for your scraped items
#
# See documentation in:
# http://doc.scrapy.org/en/latest/topics/items.html

import scrapy
import six

default = {
    "bias": None,
    "name": None,
    "url": None,
    "domain": None,
    "notes": None,
    "details": None,
    "homepage": None,
    "facebook_url": None,
    "reporting": None,
    "domains": "",
    "raw": None,
    "text": None,
    "complete": False,
    "review": False,
    "error": False,
}

class MbfcCrawlerItem(scrapy.Item):
    # define the fields for your item here like:
    bias = scrapy.Field()
    name = scrapy.Field()
    url = scrapy.Field()
    domain = scrapy.Field()
    domains = scrapy.Field()
    notes = scrapy.Field()
    details = scrapy.Field()
    homepage = scrapy.Field()
    facebook_url = scrapy.Field()
    reporting = scrapy.Field()
    complete = scrapy.Field()
    review = scrapy.Field()
    error = scrapy.Field()
    raw = scrapy.Field()
    text = scrapy.Field()

    def __init__(self, *args, **kwargs):
        super(scrapy.Item, self).__init__(default)
        if args or kwargs:  # avoid creating dict for most common case
            for k, v in six.iteritems(dict(*args, **kwargs)):
                self[k] = v
        bk = 1
