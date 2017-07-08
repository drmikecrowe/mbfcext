import json


before = json.load(open("../docs/sources.json", "r"))
after = json.load(open("sources.json", "r"))

check = ["url","bias","homepage"]

for name in before:
    if not name in after:
        print("Missing: %s (%s)" % (name, before[name]['url']))
        continue
    for k in check:
        if before[name][k] != after[name][k]:
            print("%s: %s delta:\tbefore: %s\tafter: %s" % (name, k, before[name][k], after[name][k]))