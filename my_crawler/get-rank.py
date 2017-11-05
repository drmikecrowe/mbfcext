#!/usr/bin/env python

keys = {
	# "ut": "Title",		                  # The title of the page, if available
	# "uu": "Canonical URL",		          # The canonical form of the URL
	"ueid": "External Equity Links",		# The number of external equity links to the URL
	"uid": "Links",		                 # The number of links (equity or nonequity or not, internal or external) to the URL
	"umrp": "MozRank: URL",		         # The MozRank of the URL, in both the normalized 10-point score (umrp) and the raw score (umrr)
	"umrr": "MozRank: URL Raw",		         # The MozRank of the URL, in both the normalized 10-point score (umrp) and the raw score (umrr)
	# "fmrp": "MozRank: Subdomain",		   # The MozRank of the URL's subdomain, in both the normalized 10-point score (fmrp) and the raw score (fmrr)
	# "fmrr": "MozRank: Subdomain",		   # The MozRank of the URL's subdomain, in both the normalized 10-point score (fmrp) and the raw score (fmrr)
	"us": "HTTP Status Code",		       # The HTTP status code recorded by Mozscape for this URL, if available
	# "upa": "Page Authority",		        # A normalized 100-point score representing the likelihood of a page to rank well in search engine results
	"pda": "Domain Authority",		      # A normalized 100-point score representing the likelihood of a domain to rank well in search engine results
	"ulc": "Time last crawled",		     # The time and date on which Mozscape last crawled the URL, returned in Unix epoch format
}

import os
import arrow
import json
import shelve
import time

sources = json.load(open("sources-all.json", "r"))
#'["bias","complete","details","domain","domains","error","facebook_url","homepage","name","notes","raw","reporting","review","text","url"]'


center = []
for domain in sources:
    if not "ranked" in sources[domain]:
        torank.append(domain)
        sources[domain]["rankings"] = {}
shelf["torank"] = torank

count = 0
total = len(torank)
while len(torank):
    toquery = []
    for i in range(10):
        if len(torank):
            toquery.append(torank.pop())
    if len(toquery):
        count += len(toquery)
        metriclist = client.urlMetrics(toquery)
        while len(toquery):
            domain = toquery.pop()
            metrics = metriclist.pop()
            sources[domain]["ranked"] = True
            try:
                for key in keys:
                    sources[domain]["rankings"][keys[key]] = metrics[key]
            except KeyError:
                pass
        # Save rankings as they come in
        json.dump(sources, open("sources-all.json", "w"))
        shelf["torank"] = torank
        print("Processed %d of %d -- %.0f%% complete    \r" % (count, total, (100*count/total)))
        time.sleep(10)

shelf.close()