# -*- coding: utf-8 -*-

import scrapy, re, urllib2
from urlparse import urlparse
from bs4 import BeautifulSoup

"""
Blogspider testing notes:

The crawler and its methods were really hard to test conventionally! 

Performed separate tests for parts of DatabaseHelper:
- url parsing
- creating tables
- checking table content (check_new_url)
- inserting into tables (make_new_url)

"""
"""
def get_date(url):

        page = urllib2.urlopen(url).read()
        soup = BeautifulSoup(page)
        print soup.title.string
        date = 'Unknown'
        
        for i in soup.find_all(re.compile("(date.*)|(time.*)")):
            if i.has_attr('datetime'):
                date = i['datetime']
                
        for i in soup.find_all(attrs={"itemprop" : "datePublished" }):
                date = i['title']
        
        print date

def get_date_1(url):

        page = urllib2.urlopen(url).read()
        soup = BeautifulSoup(page)
        print soup.title.string
        date = 'Unknown' 
        i = soup.find_all(attrs={"itemprop" : "datePublished"})
        print i
        
def get_date_2(url):

        page = urllib2.urlopen(url).read()
        soup = BeautifulSoup(page, 'html.parser')
        date = 'Unknown'
                
        # date displayed as text with "date" included in class name
        for i in soup.find_all(attrs={"class" : "date"}):
            node = i.contents[0]
            date = node.find_all(text=True)
            return date
        
        return date
                
        
get_date_2('https://werealloutcasts.wordpress.com') 

if netloc is already on bloghome, skip parsing this link

"""
 