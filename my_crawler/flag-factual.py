import json
import os
import shelve

os.unlink('shelf.dat')

shelf = shelve.open('shelf.dat')
sources = json.load(open("sources-all.json", "r"))
g = 0
b = 0
for key in sources:
    if key == 'complete': continue
    item = sources[key]
    if 'reporting' not in item or item['reporting'] == None or len(item['reporting']) < 2:
        # print('Flagging item for review: ', item['url'])
        item['review'] = True
        print('None')
        b += 1
    else:
        item['reporting'] = item['reporting'].encode('ascii', 'ignore').strip().upper()
        if item['reporting'].find(' (') > -1:
            item['reporting'] = item['reporting'].split(' (')[0]
        print(item['reporting'])
        g += 1
    shelf[str(item['url'])] = item
shelf.close()
print('Saved %d items to shelf.dat.  %d has reporting, %d does not' % (len(sources.keys()), g, b))
