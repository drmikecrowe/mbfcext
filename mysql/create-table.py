
import os
import json
from peewee import *

db = MySQLDatabase("mbfcdata", host='172.17.0.1', user='root', password='crowe', port=13306)


class BaseModel(Model):
    class Meta:
        database = db


class Source(BaseModel):
    domain = CharField(unique=True)
    complete = BooleanField()
    url = CharField(index=True)
    text = BlobField()
    facebook_url = CharField()
    reporting = CharField(index=True)
    bias = CharField(index=True)
    notes = BlobField()
    raw = BlobField()
    ranked = BooleanField()
    details = BlobField()
    error = BooleanField()
    domains = CharField()
    Links = IntegerField(index=True)
    HTTPStatusCode = IntegerField()
    MozRankURL = FloatField()
    Timelastcrawled = IntegerField()
    MozRankURLRaw = FloatField()
    ExternalEquityLinks = IntegerField()
    DomainAuthority = FloatField()
    Popularity = IntegerField()
    homepage = CharField(index=True)
    review = BooleanField()
    name = CharField(index=True)
    review_details = CharField()
    crawled_at = TimestampField()
    updated_at = TimestampField()



db.create_tables([Source])
