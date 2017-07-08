# -*- coding: utf-8 -*-

# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: http://doc.scrapy.org/en/latest/topics/item-pipeline.html

import json
import shelve
from scrapy.exceptions import DropItem

class MbfcCrawlerPipeline(object):
    def process_item(self, item, spider):
        if not "notes" in item:
            raise DropItem("Missing notes in %s" % item)
        return item