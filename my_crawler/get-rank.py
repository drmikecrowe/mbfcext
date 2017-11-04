#!/usr/bin/env python

import os
import arrow
import json
import shelve

from mozscape import Mozscape

parts = open(".credentials", "r").read().split("\n")

client = Mozscape(parts[0], parts[1])

doc = """
URL Metric           	Response Field	Description
Title                	ut	            The title of the page, if available
Canonical URL        	uu	            The canonical form of the URL
External Equity Links	ueid	        The number of external equity links to the URL
Links                	uid	            The number of links (equity or nonequity or not, internal or external) to the URL
MozRank: URL         	umrp,umrr	    The MozRank of the URL, in both the normalized 10-point score (umrp) and the raw score (umrr)
MozRank: Subdomain   	fmrp,fmrr	    The MozRank of the URL's subdomain, in both the normalized 10-point score (fmrp) and the raw score (fmrr)
HTTP Status Code     	us	            The HTTP status code recorded by Mozscape for this URL, if available
Page Authority       	upa	            A normalized 100-point score representing the likelihood of a page to rank well in search engine results
Domain Authority     	pda	            A normalized 100-point score representing the likelihood of a domain to rank well in search engine results
Time last crawled    	ulc	            The time and date on which Mozscape last crawled the URL, returned in Unix epoch format
"""

# Let's get some URL metrics. Results are now an array of dictionaries
# the i'th dictionary is the results for the i'th URL
metrics = client.urlMetrics(['mediabiasfactcheck.com'])

rank = metrics["umrp"]          # url rank
rank_raw = metrics["umrr"]
page_domain_authority = metrics["pda"]

bk = 1