#!/usr/bin/env python

import ConfigParser
import time

from mozscape import Mozscape

from Source import Source
from Source import db

keys = {
    # "ut": "Title",		                  # The title of the page, if available
    # "uu": "Canonical URL",		          # The canonical form of the URL
    # "fmrp": "MozRank: Subdomain",		   # The MozRank of the URL's subdomain, in both the normalized 10-point score (fmrp) and the raw score (fmrr)
    # "fmrr": "MozRank: Subdomain",		   # The MozRank of the URL's subdomain, in both the normalized 10-point score (fmrp) and the raw score (fmrr)
    # "upa": "Page Authority",		        # A normalized 100-point score representing the likelihood of a page to rank well in search engine results
    "ueid": "External Equity Links",  # The number of external equity links to the URL
    "uid":  "Links",  # The number of links (equity or nonequity or not, internal or external) to the URL
    "umrp": "MozRank: URL",  # The MozRank of the URL, in both the normalized 10-point score (umrp) and the raw score (umrr)
    "umrr": "MozRank: URL Raw",  # The MozRank of the URL, in both the normalized 10-point score (umrp) and the raw score (umrr)
    "us":   "HTTP Status Code",  # The HTTP status code recorded by Mozscape for this URL, if available
    "pda":  "Domain Authority",  # A normalized 100-point score representing the likelihood of a domain to rank well in search engine results
    "ulc":  "Time last crawled",  # The time and date on which Mozscape last crawled the URL, returned in Unix epoch format
}

config = ConfigParser.ConfigParser()
config.readfp(open('.credentials.ini'))

client = Mozscape(config.get('Moz', 'username'), config.get('Moz', 'password'))

db.execute_sql("UPDATE `source` SET ranked = 1 WHERE (Timelastcrawled >= UNIX_TIMESTAMP(DATE_ADD(NOW(), INTERVAL -365 DAY)))")
db.execute_sql("UPDATE `source` SET ranked = 0 WHERE (Timelastcrawled < UNIX_TIMESTAMP(DATE_ADD(NOW(), INTERVAL -365 DAY)))")
db.execute_sql("UPDATE `source` SET ranked = 0 WHERE (Links = 0 AND Timelastcrawled < UNIX_TIMESTAMP(DATE_ADD(NOW(), INTERVAL -30 DAY)))")

count = 0


def get_rank(toquery):
    global count, total
    count += len(toquery)
    metriclist = client.urlMetrics(toquery)
    while len(toquery):
        domain = toquery.pop()
        metrics = metriclist.pop()
        try:
            source = Source.get(Source.domain == domain)
            source.ranked = True
            rankings = {}
            for key in keys:
                rankings[keys[key]] = metrics[key]
            source.Links = rankings['Links'] if 'Links' in rankings else True
            source.MozRankURL = rankings['MozRank: URL'] if 'MozRank: URL' in rankings else True
            source.MozRankURLRaw = rankings['MozRank: URL Raw'] if 'MozRank: URL Raw' in rankings else True
            source.DomainAuthority = rankings['Domain Authority'] if 'Domain Authority' in rankings else True
            source.HTTPStatusCode = rankings['HTTP Status Code'] if 'HTTP Status Code' in rankings else True
            source.ExternalEquityLinks = rankings['External Equity Links'] if 'External Equity Links' in rankings else True
            source.Timelastcrawled = rankings['Time last crawled'] if 'Time last crawled' in rankings else True
            if source.Timelastcrawled == 0:
                source.Timelastcrawled = time.time()
            source.save()
            print("Updated domain %s" % domain)
        except Exception as ex:
            print(ex)
            pass
    print("Processed %d of %d -- %.0f%% complete    \r" % (count, total, (100 * count / total)))
    time.sleep(10)


todo = []
total = Source.select().where(Source.ranked == 0).count()
for s in Source.select().where(Source.ranked == 0):
    todo.append(s.domain)
    if len(todo) >= 10:
        get_rank(todo)
        todo = []
if len(todo) > 0:
    get_rank(todo)
