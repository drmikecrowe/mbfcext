import json
import shelve
import os

os.unlink('shelf.dat')

shelf = shelve.open('shelf.dat')
sources = json.load(open("sources-all.json", "r"))
for key in sources:
    if key == 'complete': continue
    item = sources[key]
    shelf[str(item['url'])] = item
shelf.close()
print('Saved %d items to shelf.dat' % len(sources.keys()))