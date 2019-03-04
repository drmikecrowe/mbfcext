# -*- coding: utf-8 -*-

# Define here the models for your scraped items
#
# See documentation in:
# http://doc.scrapy.org/en/latest/topics/items.html

import scrapy


class BlogspiderItem(scrapy.Item):
    """definitions for the fields of a link item"""

    url = scrapy.Field()
    wpblog = scrapy.Field() # true if it is a wordpress blog page
    title = scrapy.Field() # page title
    review_post = scrapy.Field() # true if it is a review post
    home = scrapy.Field() # home page of blog post
