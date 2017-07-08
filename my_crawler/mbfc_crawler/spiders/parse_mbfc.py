# -*- coding: utf-8 -*-
import re
import shelve
from urlparse import urlparse

import scrapy

try:
    from mbfc_crawler.items import MbfcCrawlerItem
except ImportError:
    from items import MbfcCrawlerItem

check = [
    "https://www.facebook.com/dialog",
    "https://www.facebook.com/sharer.php?s",
    "https://www.facebook.com/tampabaycom",
    "https://www.facebook.com/tr?ev",
    "https://www.facebook.com/wired",
    "https://www.facebook.com/groups",
    "https://www.facebook.com/newstargetofficial",
    "https://www.facebook.com/share.php?u",
    "https://www.facebook.com/sharer.php?u",
    "https://www.facebook.com/sharer",
    "https://www.facebook.com/plugins",
    "https://www.facebook.com/tr?id",
    "https://www.facebook.com/pages",
]

review = [
    'https://mediabiasfactcheck.com/msnbc/'
]

override = {
    'https://mediabiasfactcheck.com/cato-institute/': 'cato.org',
    'https://mediabiasfactcheck.com/regulation-magazine/': 'cato.org/regulation',
    'https://mediabiasfactcheck.com/factcheck/': 'factcheck.org',
    'https://mediabiasfactcheck.com/scicheck/': 'factcheck.org/scicheck',
    'https://mediabiasfactcheck.com/hoover-institution/': 'hoover.org',
    'https://mediabiasfactcheck.com/policy-review/': 'hoover.org/publications/policy-review',
    'https://mediabiasfactcheck.com/public-radio-international-pri/': 'pri.org',
    'https://mediabiasfactcheck.com/global-post/': 'pri.org/programs/globalpost',
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
    global check
    for t in check:
        if t == item['facebook_url']:
            return True
    return False


class ParseMbfc(scrapy.Spider):
    review = 'truth-and-action'
    shelf = shelve.open('shelf.dat')
    try:
        complete = shelf['complete']
    except KeyError:
        shelf['complete'] = {}

    def closed(self, reason):
        self.shelf.close()

    def complete(self, item):
        item['complete'] = True
        self.shelf[str(item['url'])] = dict(item)
        self.shelf["complete"][str(item['url'])] = True

    def errorback(self, response):
        item = response.request.meta['item']
        item['error'] = True
        self.complete(item)
        self.logger.error('URL Invalid, flagging: %s', response.request.url)

    def parse(self, response):
        reviewed = 0
        selectors = response.css('.hentry > .entry > p').css('a::attr(href)')
        if len(selectors) == 0:
            selectors = response.css('p[style*="text-align:center"]').css('a::attr(href)')
        for link in selectors:
            reviewed += 1
            url = link.extract().replace("http:", "https:")
            if url.find(self.review) > -1:
                bk = 1
            try:
                item = self.shelf[str(url)]
                if item['error']:
                    self.logger.info('Error %s -- skipping', response.url)
                    self.complete(item)
                    yield item
                    continue
                if item['complete'] and not item['review']:
                    self.logger.info('Already processed %s -- skipping', item['url'])
                    self.complete(item)
                    yield item
                    continue
            except KeyError:
                pass
            item = MbfcCrawlerItem()
            item['url'] = url
            item['bias'] = response.meta['bias']
            self.shelf[str(url)] = dict(item)
            request = scrapy.Request(url, callback=self.parse_details, errback=self.errorback, dont_filter=True)
            request.meta['item'] = item
            self.logger.info('Processing %s', item['url'])
            yield request
        if reviewed == 0:
            self.logger.error('No items processed on %s!' % response.url)
            bk = 1

    def parse_details(self, response):
        item = response.meta['item']
        if item['url'].find(self.review) > -1:
            bk = 1
        if item['url'].find("mediabiasfactcheck.com") > -1:
            del self.shelf[str(item['url'])]
        for page in response.css('article.hentry'):
            item['name'] = tostr(page.css('h1.page-title::text').extract_first())
            review = {}
            review['loaded'] = False
            raw = page.css(".hentry p").extract()
            text = page.css(".hentry p").css("::text").extract()
            item['raw'] = "".join(raw)
            item['text'] = "".join(text)
            stage = None
            factual = -1
            notes = -1
            source = -1
            latest = -1
            i = 0
            for t in raw:
                if t.find("Factual Reporting:") > -1:
                    factual = i
                if t.find("Notes:") > -1:
                    notes = i
                if t.find("Source:") > -1 or t.find("Sources:") > -1:
                    source = i
                if t.find("Latest from") > -1:
                    latest = i
                i += 1
            if latest == -1:
                latest = i
            if source == -1:
                item['review'] = True
                self.logger.info('Missing information for %s (f=%d,n=%d,s=%d)-- skipping', response.url, factual, notes, source)
                self.complete(item)
                yield item
                continue

            # Get factual reporting
            if factual > -1:
                text = "".join(page.css('.hentry p')[factual].css("::text").extract())
                item["reporting"] = tostr(text).replace("Factual Reporting:", "")

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
                o = urlparse(urls[0])
                item["homepage"] = tostr(o.geturl())
                item["domain"] = tostr(o.netloc)
                if item['url'] in override:
                    item['domain'] = override[item['url']]
                item['review'] = False
            else:
                urls = re.findall('http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', re.sub('<[^<]+?>', '', item['text']))
                if len(urls) > 0:
                    o = urlparse(urls[0])
                    item["homepage"] = tostr(o.geturl())
                    item["domain"] = tostr(o.netloc)
                    if item['url'] in override:
                        item['domain'] = override[item['url']]
                    item['review'] = False
                else:
                    item['review'] = True

            if not item['homepage'] or not item['domain']:
                item['review'] = True
                self.logger.info('No homepage %s -- skipping looking up facebook', response.url)
                self.complete(item)
                yield item
                continue

            if len(dict(item).keys()) < 7 and item['bias'] != 'satire':
                item['review'] = True
            if item['facebook_url']:
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
            if fburl and not fburl in check and len(fburl) > 14:
                item['facebook_url'] = 'https://www.' + fburl
                break
        self.complete(item)
        yield item
