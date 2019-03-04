from scrapy.dupefilters import RFPDupeFilter
from spiders.DatabaseHelper import DatabaseHelper

class SeenURLFilter(RFPDupeFilter):
    """A dupe filter that considers the URL"""

    def __init__(self, path=None):
        RFPDupeFilter.__init__(self, path)

    def request_seen(self, request):
        unique = DatabaseHelper.check_new_url(request.url)
        if not unique:
            return True



import os
from scrapy.utils.request import request_fingerprint

class CustomFilter(RFPDupeFilter):
"""A dupe filter that considers specific ids in the url"""

    def __getid(self, url):
        mm = url.split("&refer")[0] #or something like that
        return mm

    def request_seen(self, request):
        fp = self.__getid(request.url)
        if fp in self.fingerprints:
            return True
        self.fingerprints.add(fp)
        if self.file:
            self.file.write(fp + os.linesep)

# DUPEFILTER_CLASS = 'scraper.duplicate_filter.CustomFilter'
