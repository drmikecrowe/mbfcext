import json

from Source import *

sources = json.load(open("sources-all.json", "r"))
fields = {}
for key in sources:
    if key == 'complete': continue
    create_or_update_source(sources[key])
