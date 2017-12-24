import json
import os

from unidecode import unidecode

from Source import Source

csources = {}
sources = {}
sources_all = {}
sources_error = {}
sources_review = {}

skeys = ["name", "bias", "facebook_url", "homepage", "url", "reporting", "Links", "MozRankURL"]

for source in Source.select().where((Source.complete == 1) & (Source.review == 0)):
    item = source.toJSON()
    for k in item:
        try:
            item[k] = unidecode(item[k])
        except AttributeError:
            pass
        except UnicodeDecodeError:
            pass
    try:
        complete = item['domain'] != None and item['homepage'] != None
        if not complete and item['complete']:
            print('Flagging item for review: ', item['url'])
            source.review = True
            source.save()
        if item['complete']:
            item['review'] = False
            item['error'] = False
        if item['domain'] == None or item['domain'] == 'null' or item['domain'].find("mediabiasfactcheck.com") > -1:
            item['review'] = True
        else:
            item['review'] = False
        if not item['review']:
            if item['bias'] == 'fake-news':
                item['reporting'] = 'FAKE'
            item['domain'] = item['domain'].replace("www.", "")

    except AttributeError:
        # if item['url'].find('mediabiasfactcheck.com/msnbc/') > -1:
        #     print(repr(item))
        pass
    except TypeError:
        # if item['url'].find('mediabiasfactcheck.com/msnbc/') > -1:
        #     print(repr(item))
        continue
    try:
        key = item['domain'] if item['domain'] else item['url']
        sources_all[key] = item
        if not item['error'] and not item['review']:
            sources[key] = {k: item[k] for k in skeys}
            sources[key]['domain'] = key
            csources[key] = {k[:1]: item[k] for k in skeys}
            csources[key]['d'] = key
        if item['error']:
            sources_error[key] = item
        if item['review']:
            sources_review[key] = item
    except KeyError:
        print(repr(item))
    except TypeError:
        # if item['url'].find('mediabiasfactcheck.com/msnbc/') > -1:
        #     print(repr(item))
        continue

todo = {
    "sources-all.json":    sources_all,
    "sources.json":        sources,
    "csources.json":       csources,
    "sources-error.json":  sources_error,
    "sources-review.json": sources_review,
}
for k in todo:
    v = todo[k]
    try:
        if k == "sources.json" or k == "csources.json":
            s = json.dumps(v, encoding='latin1')
        else:
            s = json.dumps(v, encoding='latin1', sort_keys=True, indent=4, separators=(',', ': '))
    except UnicodeDecodeError as ude:
        pass
    open(k, "w").write(s)
    print('Saved %d items to %s' % (len(v.keys()), k))
    if k == "csources.json":
        if len(v.keys()) > 1700:
            open("valid.export", "w").write("\n")
        else:
            if os.path.exists("valid.export"):
                os.unlink("valid.export")

biases = json.load(open("biases.json", "r"))
for bias in biases:
    if bias == 'fake-news' or bias == 'satire' or bias == 'conspiracy':
        continue
    domains = []
    for source in Source.select().where((Source.complete == 1) & (Source.review == 0) & (Source.bias == bias) & ((Source.reporting == 'HIGH') | (Source.reporting=='VERY HIGH'))).order_by(Source.MozRankURL.desc()).limit(500):
        domains.append(source.domain)
    open(biases[bias]["name"] + ".txt", "w").write("\n".join(domains))

domains = []
for source in Source.select().where((Source.complete == 1) & (Source.review == 0) & ((Source.reporting == 'HIGH') | (Source.reporting == 'VERY-HIGH'))).order_by(Source.MozRankURL.desc()).limit(500):
    domains.append(source.domain)
open("Factual Reporting.txt", "w").write("\n".join(domains))
