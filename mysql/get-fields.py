import json


def to_peewee(t, key, val):
    if t == unicode:
        if len(val) > 255 or val.find("\n") > -1:
            print("    %s = BlobField()" % key.replace(" ", "").replace(":", ""))
        elif key == "domain":
            print("    %s = CharField(unique=True)" % key.replace(" ", "").replace(":", ""))
        else:
            print("    %s = CharField()" % key.replace(" ", "").replace(":", ""))
        fields[key] = ''
    elif t == dict:
        data = sources[domain][key]
        for key2 in data:
            if key2 in fields: continue
            t2 = type(data[key2])
            to_peewee(t2, key2, data[key2])
            fields[key2] = True
        fields[key] = True
    elif t == bool:
        print("    %s = BooleanField()" % key.replace(" ", "").replace(":", ""))
        fields[key] = False
    elif t == int:
        print("    %s = IntegerField()" % key.replace(" ", "").replace(":", ""))
        fields[key] = 0
    elif t == float:
        print("    %s = FloatField()" % key.replace(" ", "").replace(":", ""))
        fields[key] = 0.0
    else:
        print(key, t)


sources = json.load(open("sources-all.json", "r"))
fields = {}
after = []
print("class Source(Model):")
for domain in sources:
    if domain == 'complete': continue
    for key in sources[domain]:
        if key in fields: continue
        t = type(sources[domain][key])
        to_peewee(t, key, sources[domain][key])

print(' ')
print(' ')
for key in fields:
    skey = key.replace(" ", "").replace(":", "")
    retrieve = "    %s = js['%s'] if '%s' in js and js['%s'] else " % (skey, key, key, key)
    retrieve += repr(fields[key])
    print(retrieve)

print(' ')
print(' ')
for key in fields:
    skey = key.replace(" ", "").replace(":", "")
    print("    if source.%s != %s:" % (skey, skey))
    print("        print(domain + ': %s changed from ' + repr(source.%s) + ' -> ' + repr(%s))" % (skey, skey, skey))
    print("        source.%s = %s" % (skey, skey))
    print("        dirty = True")


print(' ')
print(' ')
todo = []
for key in fields:
    skey = key.replace(" ", "").replace(":", "")
    todo.append("%s=%s" % (skey, skey))
print("    source = Source.create(%s)" % ",".join(todo))