import json
import shelve
import os
from unidecode import unidecode

shelf = shelve.open('shelf.dat')
csources = {}
sources = {}
sources_all = {}
sources_error = {}
sources_review = {}

skeys = ["name", "bias", "facebook_url", "homepage", "url", "reporting"]

for key in shelf:
    if key == 'complete': continue
    item = shelf[key]
    for k in item:
        try:
            item[k] = unidecode(item[k])
        except AttributeError:
            pass
    try:
        if key.find('mediabiasfactcheck.com') > -1:
            bk = 1
        else:
            bk = 1
        complete = item['domain'] != None and item['homepage'] != None
        if not complete and item['complete']:
            print('Flagging item for review: ', item['url'])
            item['review'] = True
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
        shelf[key] = item
    except AttributeError:
        # if item['url'].find('mediabiasfactcheck.com/msnbc/') > -1:
        #     print(repr(item))
        pass
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

todo = {
    "sources-all.json": sources_all,
    "sources.json": sources,
    "csources.json": csources,
    "sources-error.json": sources_error,
    "sources-review.json": sources_review,
}
for k in todo:
    v = todo[k]
    if k == "sources.json" or k == "csources.json":
        s = json.dumps(v)
    else:
        s = json.dumps(v, sort_keys=True, indent=4, separators=(',', ': '))
    open(k, "w").write(s)
    print('Saved %d items to %s' % (len(v.keys()), k))
    if k == "csources.json":
        if len(v.keys()) > 1700:
            open("valid.export", "w").write("\n")
        else:
            if os.path.exists("valid.export"):
                os.unlink("valid.export")


shelf.close()