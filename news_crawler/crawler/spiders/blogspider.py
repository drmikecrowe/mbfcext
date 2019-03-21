# -*- coding: utf-8 -*-

import scrapy
import os
from os import path
from distutils.dir_util import mkpath
import html2text
import re

def tostr(text):
    text = text if text else ""
    text = ''.join([i if ord(i) < 128 else ' ' for i in text])
    text = str(text)
    remove = ["Source:", "Notes:"]
    for todo in remove:
        text = text.replace(todo, "").replace(todo.lower(), "")
    return text.strip()


class BlogSpider(scrapy.Spider):
    """ a spider for crawling through pages given starting url"""

    name = "blogspider"
    start_urls = ["https://mediabiasfactcheck.com/news/"]

    def parse(self, response):
        any = False
        for href in response.css('article > header  > h3 > a::attr(href)'):
            root = href.root
            base = root.replace("https://mediabiasfactcheck.com/", "")[:-1]
            if re.search(r'(2019|202\d)/\d{2}/\d{2}', base):
                any = True
                fname = "markdown/" + base + ".md"
                if not path.exists(fname):
                    yield response.follow(href, self.parse_blogpost)

        # follow pagination links
        for href in response.css('a.page-numbers::attr(href)'):
            if any:
                yield response.follow(href, self.parse)

    def parse_blogpost(self, response):
        text_maker = html2text.HTML2Text()
        text_maker.protect_links = True
        text_maker.wrap_links = False
        base = response.url.replace("https://mediabiasfactcheck.com/", "")[:-1]
        if not re.search(r'(2019|202\d)/\d{2}/\d{2}', base):
            base = response.request.meta["redirect_urls"][0].replace("https://mediabiasfactcheck.com/", "")[:-1]
        fname = "markdown/" + base + ".md"
        if path.exists(fname):
            return
        try:
            created = response.css('meta[property*="article:published_time"]')[0].root.attrib["content"]
        except Exception:
            created = base[:10].replace("/", "-") + "T00:00:00+00:00"
        for page in response.css('article.hentry'):
            content = []
            title = tostr(page.css('h1.entry-title::text').extract_first())
            for entry in page.css(".hentry p"):
                details = entry.extract()
                if details.startswith("<div"):
                    continue
                if details.find("<script") > -1:
                    break
                details = re.sub(r'<br/?>\n?</strong>', '</strong><br/>', details, re.DOTALL)
                details = re.sub(r'</?em>', '', details)
                content.append(details)
            dirname = path.dirname(fname)
            mkpath(dirname)
            markdown = """---
path: "/%s"
date: "%s"
title: "%s"
original: "%s"  
news: true
---

%s
""" % (base, created, title, response.url, text_maker.handle("".join(content)))
            open(fname, "w").write(markdown.encode("UTF-8"))
            pass

