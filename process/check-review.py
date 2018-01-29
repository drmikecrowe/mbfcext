import json
import sys

last = json.load(open("../docs/revised/sources.json", "r"))
current = json.load(open("sources.json"))

review = []

for key in current:
    if key in last and last[key]["Links"] > current[key]["Links"] and current[key]["Links"] == 1:
        if False and key not in review:
            review.append(key)

    if current[key]["bias"] == "":
        if key not in review:
            review.append(key)

json.dump(review, open("/home/mcrowe/Programming/Personal/show_media_bias/my_crawler/review.json", "wb"))
sys.exit(len(review))