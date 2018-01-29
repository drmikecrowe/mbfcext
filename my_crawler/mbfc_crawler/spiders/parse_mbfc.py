# -*- coding: utf-8 -*-
import datetime
import re
from urlparse import urlparse
import socket
import json
import os

import scrapy
from scrapy import signals

from Source import Source
from Source import db
from Source import create_or_update_source

from scrapy.spidermiddlewares.httperror import HttpError
from scrapy.exceptions import IgnoreRequest
from twisted.internet.error import DNSLookupError
from twisted.internet.error import TimeoutError, TCPTimedOutError

try:
    from mbfc_crawler.items import MbfcCrawlerItem
except ImportError:
    from items import MbfcCrawlerItem

facebook_ignore = [
    "facebook.com/Conservative",
    "facebook.com/Left",
    "facebook.com/MarketWatch",
    "facebook.com/The",
    "facebook.com/TheTruthMonitor/",
    "facebook.com/TmzWorldstar/",
    "facebook.com/USDailyNewss/",
    "facebook.com/app",
    "facebook.com/dialog",
    "facebook.com/groups",
    "facebook.com/home.php",
    "facebook.com/newstargetofficial",
    "facebook.com/pages",
    "facebook.com/pages/American",
    "facebook.com/pages/Australian",
    "facebook.com/pages/Committee",
    "facebook.com/pages/Foreign",
    "facebook.com/pages/Hoover",
    "facebook.com/pages/Left",
    "facebook.com/pages/New",
    "facebook.com/pages/The",
    "facebook.com/profile.php?id",
    "facebook.com/share.php?u",
]

facebook_ignore_prefixes = [
    "facebook.com/plugins",
    "facebook.com/sharer",
    "facebook.com/tr?",
    "facebook.com/v2.6",
]
for pattern in facebook_ignore_prefixes:
    db.execute_sql("UPDATE source SET facebook_url='' WHERE facebook_url LIKE '%%" + pattern + "%%'")

REVIEW_FILE="/home/mcrowe/Programming/Personal/show_media_bias/my_crawler/review.json"
review = json.load(open(REVIEW_FILE, "r"))
for i in range(len(review)):
    key = review[i]
    source = Source.get(domain=str(key))
    if source:
        review[i] = source.url
    else:
        bk = 1
dns_lookup = []

override = {
    'https://mediabiasfactcheck.com/cato-institute/':                 'cato.org',
    'https://mediabiasfactcheck.com/regulation-magazine/':            'cato.org/regulation',
    'https://mediabiasfactcheck.com/factcheck/':                      'factcheck.org',
    'https://mediabiasfactcheck.com/scicheck/':                       'factcheck.org/scicheck',
    'https://mediabiasfactcheck.com/hoover-institution/':             'hoover.org',
    'https://mediabiasfactcheck.com/policy-review/':                  'hoover.org/publications/policy-review',
    'https://mediabiasfactcheck.com/public-radio-international-pri/': 'pri.org',
    'https://mediabiasfactcheck.com/global-post/':                    'pri.org/programs/globalpost',
}


def tostr(text):
    text = text if text else ""
    text = ''.join([i if ord(i) < 128 else ' ' for i in text])
    text = str(text)
    remove = ["Source:", "Notes:"]
    for todo in remove:
        text = text.replace(todo, "").replace(todo.lower(), "")
    return text.strip()


def check_fb_needed(item):
    global facebook_ignore
    for t in facebook_ignore:
        if t == item['facebook_url']:
            return True
    return False


def parse_url(url):
    o = urlparse(url)
    obj = {
        "homepage": tostr(o.geturl()),
        "domain":   tostr(o.netloc),
        "url":      url,
    }
    if obj["url"] in override:
        obj["domain"] = override[obj["url"]]
    return obj


def check_dns(domain):
    try:
        if domain not in dns_lookup:
            socket.gethostbyname(domain)
            dns_lookup.append(domain)
        return True
    except Exception:
        return False


class ParseMbfc(scrapy.Spider):
    reviewing = False

    def complete(self, item):
        if type(item) == Source:
            item.complete = True
            item.crawled_at = datetime.datetime.now()
            item.save()
        else:
            item['complete'] = True
            item['crawled_at'] = datetime.datetime.now()
            create_or_update_source(dict(item))

    def review(self, item, msg):
        if type(item) == Source:
            item.review = True
            item.review_details = msg
            item.complete = True
            item.crawled_at = datetime.datetime.now()
            item.save()
        else:
            item['review_details'] = msg
            item['review'] = True
            item['complete'] = True
            item['crawled_at'] = datetime.datetime.now()
            create_or_update_source(dict(item))

    def get_domain(self, request):
        try:
            domain = request.meta['domain']
        except KeyError:
            domain = request.meta['item']['domain']
        return domain

    def errorback(self, failure):
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

        elif failure.check(IgnoreRequest):
            request = failure.request
            self.logger.info('Ignored %s', request.url)

        else:
            self.logger.error(repr(failure))
            request = failure.request
            flag = True

        if flag:
            domain = self.get_domain(request)
            sources = Source.get_or_create(domain=domain)
            source = sources[0]
            source.error = True
            self.complete(source)
            self.logger.error('URL Invalid, flagging: %s', request.url)

    def parse(self, response):
        reviewed = 0
        selectors = response.css('.hentry > .entry > p').css('a::attr(href)')
        if len(selectors) == 0:
            selectors = response.css('p[style*="text-align:center"]').css('a::attr(href)')
        for link in selectors:
            reviewed += 1
            url = link.extract().replace("http:", "https:")
            try:
                sources = Source.get_or_create(url=str(url))
                source = sources[0]
                # if source.error:
                #     self.logger.info('Error %s -- skipping', response.url)
                #     self.complete(source)
                #     yield source
                #     continue
                # if source.complete and not source.review:
                #     self.logger.info('Already processed %s -- skipping', source.url)
                #     yield None
                #     continue
                #TODO: Add a test here to do it more intelligently
            except KeyError:
                pass
            except Exception as ex:
                pass

            # If we have review items in the list, then only crawl those pages
            if self.reviewing or len(review) > 0:
                self.reviewing = True
                if url not in review:
                    yield None
                    continue
                del review[review.index(url)]

            item = MbfcCrawlerItem()
            item['url'] = url
            item['bias'] = response.meta['bias']
            response.meta['url'] = url
            request = scrapy.Request(url, callback=self.parse_details, errback=self.errorback, dont_filter=True)
            request.meta['item'] = item
            self.logger.info('Processing %s', url)
            yield request

    def parse_details(self, response):
        item = response.meta['item']
        for page in response.css('article.hentry'):
            item['name'] = tostr(page.css('h1.page-title::text').extract_first())
            raw = page.css(".hentry p").extract()
            text = page.css(".hentry p").css("::text").extract()
            item['raw'] = "".join(raw)
            item['text'] = "".join(text)
            factual = -1
            notes = -1
            source = -1
            latest = -1
            dup_notes = -1
            i = 0
            for t in raw:
                if t.find("Factual Reporting:") > -1:
                    factual = i
                if t.find("Notes:") > -1:
                    if notes > -1:
                        dup_notes = notes
                    notes = i
                    if t.find("The Fucking News") > -1 and source == -1:
                        item["homepage"] = "http://thefingnews.com"
                        item["domain"] = "thefingnews.com"
                        source = notes
                    elif t.find("News Examiner") > -1 and source == -1:
                        item["homepage"] = "http://newsexaminer.net"
                        item["domain"] = "newsexaminer.net"
                        source = notes
                if t.find("Source:") > -1 or t.find("Sources:") > -1:
                    source = i
                if t.find("Latest from") > -1:
                    latest = i
                i += 1
            if latest == -1:
                latest = i
            if source == -1 and dup_notes > -1:
                source = dup_notes
            if source == -1:
                item['review'] = True
                item['review_details'] = 'Missing information for %s (f=%d,n=%d,s=%d)-- skipping' % (response.url, factual, notes, source)
                self.complete(item)
                yield item
                continue

            # Get factual reporting
            if factual > -1:
                text = "".join(page.css('.hentry p')[factual].css("::text").extract())
                reporting = tostr(text).replace("Factual Reporting:", "").strip()
                if reporting.upper() in ['LOW', 'MIXED', 'HIGH', 'VERY HIGH']:
                    item["reporting"] = reporting
                else:
                    bk = 1

                    # Get notes
            if notes > -1:
                text = "".join(page.css('.hentry p')[notes:source].extract())
                item["details"] = tostr(text).replace("Notes:", "")
                text = "".join(page.css('.hentry p')[notes:source].css("::text").extract())
                item["notes"] = tostr(text).replace("Notes:", "")
                if source == -1:
                    source = notes

            selector = page.css(".hentry p")[source:latest]
            urls = selector.css('a::attr("href")').extract()
            if len(urls) > 0:
                obj = parse_url(urls[0])
                item['homepage'] = obj["homepage"]
                item['domain'] = obj["domain"]
                item['url'] = urls[0]
                item['review'] = False
            else:
                urls = re.findall('http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', re.sub('<[^<]+?>', '', item['text']))
                if len(urls) > 0:
                    obj = parse_url(urls[0])
                    item['homepage'] = obj["homepage"]
                    item['domain'] = obj["domain"]
                    item['url'] = urls[0]
                    item['review'] = False
                else:
                    item['review'] = True
                    item['review_details'] = 'No URLs found'

            if not item['homepage'] or not item['domain']:
                item['review'] = True
                item['review_details'] = 'No homepage %s -- skipping looking up facebook' % (response.url)
                self.complete(item)
                yield item
                continue

            if not check_dns(item['domain']):
                item['error'] = True
                self.logger.error('No DNS entry found for %s' % item['domain'])
                self.complete(item)
                yield item
                continue

            # if len(dict(item).keys()) < 7 and source.bias != 'satire':
            #     source.review = True
            #     source.review_details = 'Not enough information'

            if (item['facebook_url'] and item['facebook_url'] > '') or item['reporting'] == 'FAKE':
                self.complete(item)
                yield item
                continue

            request = scrapy.Request(item["homepage"], callback=self.parse_homepage, errback=self.errorback, dont_filter=True)
            request.meta['item'] = item
            yield request

    def parse_homepage(self, response):
        item = response.meta['item']
        fburls = response.css('body').re('facebook.com\/[a-zA-Z0-9/(\.\?)?]+')
        for fburl in fburls:
            if fburl and not fburl in facebook_ignore and len(fburl) > 14:
                ignore = False
                for test in facebook_ignore_prefixes:
                    if fburl.startswith(test):
                        ignore = True
                if ignore:
                    continue
                item['facebook_url'] = 'https://www.' + fburl
                break
        self.complete(item)
        yield item

    @classmethod
    def from_crawler(cls, crawler, *args, **kwargs):
        spider = super(ParseMbfc, cls).from_crawler(crawler, *args, **kwargs)
        crawler.signals.connect(spider.spider_closed, signal=signals.spider_closed)
        return spider

    def spider_closed(self, reason):
        for key in review:
            if key > "":
                self.logger.error('Flagging URL as an error (not found): %s', key)
                sources = Source.get_or_create(domain=key)
                source = sources[0]
                source.error = True
                source.complete = True
                source.crawled_at = datetime.datetime.now()
                source.save()
            del review[review.index(key)]
        json.dump(review, open(REVIEW_FILE, "wb"))
