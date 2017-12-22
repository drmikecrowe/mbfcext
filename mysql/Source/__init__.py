import datetime
import ConfigParser
from peewee import *


config = ConfigParser.ConfigParser()
config.readfp(open('../.credentials.ini'))

db = MySQLDatabase(config.get('MySQL', 'table'), host=config.get('MySQL', 'host'), user=config.get('MySQL', 'username'), password=config.get('MySQL', 'password'), port=3306)


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
    homepage = CharField(index=True)
    review = BooleanField()
    name = CharField(index=True)
    review_details = CharField()
    crawled_at = TimestampField()
    updated_at = TimestampField()
    
    def toJSON(self):
        return {
            "domain": self.domain,
            "complete": self.complete,
            "url": self.url,
            "text": self.text,
            "facebook_url": self.facebook_url,
            "reporting": self.reporting,
            "bias": self.bias,
            "notes": self.notes,
            "raw": self.raw,
            "ranked": self.ranked,
            "details": self.details,
            "error": self.error,
            "domains": self.domains,
            "Links": self.Links,
            "HTTPStatusCode": self.HTTPStatusCode,
            "MozRankURL": self.MozRankURL,
            "Timelastcrawled": self.Timelastcrawled,
            "MozRankURLRaw": self.MozRankURLRaw,
            "ExternalEquityLinks": self.ExternalEquityLinks,
            "DomainAuthority": self.DomainAuthority,
            "homepage": self.homepage,
            "review": self.review,
            "name": self.name,
            "review_details": self.review_details,
            "crawled_at": self.crawled_at.isoformat() if type(self.crawled_at) == datetime else False,
            "updated_at": self.updated_at.isoformat() if type(self.updated_at) == datetime else False,
        }


def create_or_update_source(js):
    domain = js['domain'] if 'domain' in js and js['domain'] else ''
    if domain == '':
        print("Invalid record: ", repr(js))
        return

    text = js['text'] if 'text' in js and js['text'] else ''
    raw = js['raw'] if 'raw' in js and js['raw'] else ''
    bias = js['bias'] if 'bias' in js and js['bias'] else ''
    review = js['review'] if 'review' in js and js['review'] else False
    details = js['details'] if 'details' in js and js['details'] else ''
    homepage = js['homepage'] if 'homepage' in js and js['homepage'] else ''
    review_details = js['review_details'] if 'review_details' in js and js['review_details'] else ''
    complete = js['complete'] if 'complete' in js and js['complete'] else False
    facebook_url = js['facebook_url'] if 'facebook_url' in js and js['facebook_url'] else ''
    reporting = js['reporting'] if 'reporting' in js and js['reporting'] else ''
    ranked = js['ranked'] if 'ranked' in js and js['ranked'] else False
    name = js['name'] if 'name' in js and js['name'] else ''
    url = js['url'] if 'url' in js and js['url'] else ''
    notes = js['notes'] if 'notes' in js and js['notes'] else ''
    error = js['error'] if 'error' in js and js['error'] else False
    domains = js['domains'] if 'domains' in js and js['domains'] else ''

    rankings = js['rankings'] if 'rankings' in js and js['rankings'] else {}
    Links = rankings['Links'] if 'Links' in rankings and rankings['Links'] else True
    MozRankURL = rankings['MozRank: URL'] if 'MozRank: URL' in rankings and rankings['MozRank: URL'] else True
    MozRankURLRaw = rankings['MozRank: URL Raw'] if 'MozRank: URL Raw' in rankings and rankings['MozRank: URL Raw'] else True
    DomainAuthority = rankings['Domain Authority'] if 'Domain Authority' in rankings and rankings['Domain Authority'] else True
    HTTPStatusCode = rankings['HTTP Status Code'] if 'HTTP Status Code' in rankings and rankings['HTTP Status Code'] else True
    ExternalEquityLinks = rankings['External Equity Links'] if 'External Equity Links' in rankings and rankings['External Equity Links'] else True
    Timelastcrawled = rankings['Time last crawled'] if 'Time last crawled' in rankings and rankings['Time last crawled'] else True

    try:
        with db.atomic():
            Source.create(domain=domain, text=text, raw=raw, bias=bias, review=review, MozRankURL=MozRankURL, details=details, Timelastcrawled=Timelastcrawled, MozRankURLRaw=MozRankURLRaw,
                          homepage=homepage, review_details=review_details, complete=complete, HTTPStatusCode=HTTPStatusCode, facebook_url=facebook_url, reporting=reporting, ranked=ranked,
                          ExternalEquityLinks=ExternalEquityLinks, name=name, Links=Links, url=url, notes=notes, error=error, domains=domains, DomainAuthority=DomainAuthority)

    except IntegrityError:
        source = Source.get(Source.domain == domain)

        dirty = False
        if source.text != text:
            print(domain + ': text changed')
            source.text = text
            dirty = True
        if source.raw != raw:
            print(domain + ': raw changed')
            source.raw = raw
            dirty = True
        if source.bias != bias:
            print(domain + ': bias changed from ' + repr(source.bias) + ' -> ' + repr(bias))
            source.bias = bias
            dirty = True
        if source.review != review:
            print(domain + ': review changed from ' + repr(source.review) + ' -> ' + repr(review))
            source.review = review
            dirty = True
        if source.details != details:
            print(domain + ': details changed')
            source.details = details
            dirty = True
        if source.homepage != homepage:
            print(domain + ': homepage changed from ' + repr(source.homepage) + ' -> ' + repr(homepage))
            source.homepage = homepage
            dirty = True
        if source.review_details != review_details:
            print(domain + ': review_details changed from ' + repr(source.review_details) + ' -> ' + repr(review_details))
            source.review_details = review_details
            dirty = True
        if source.complete != complete:
            print(domain + ': complete changed from ' + repr(source.complete) + ' -> ' + repr(complete))
            source.complete = complete
            dirty = True
        if source.facebook_url != facebook_url:
            print(domain + ': facebook_url changed from ' + repr(source.facebook_url) + ' -> ' + repr(facebook_url))
            source.facebook_url = facebook_url
            dirty = True
        if source.reporting != reporting:
            print(domain + ': reporting changed from ' + repr(source.reporting) + ' -> ' + repr(reporting))
            source.reporting = reporting
            dirty = True
        if source.ranked != ranked:
            print(domain + ': ranked changed from ' + repr(source.ranked) + ' -> ' + repr(ranked))
            source.ranked = ranked
            dirty = True
        if source.name != name:
            print(domain + ': name changed from ' + repr(source.name) + ' -> ' + repr(name))
            source.name = name
            dirty = True
        if source.Links != Links:
            print(domain + ': Links changed from ' + repr(source.Links) + ' -> ' + repr(Links))
            source.Links = Links
            dirty = True
        if source.url != url:
            print(domain + ': url changed from ' + repr(source.url) + ' -> ' + repr(url))
            source.url = url
            dirty = True
        if source.notes != notes:
            print(domain + ': notes changed')
            source.notes = notes
            dirty = True
        if source.error != error:
            print(domain + ': error changed from ' + repr(source.error) + ' -> ' + repr(error))
            source.error = error
            dirty = True
        if source.domains != domains:
            print(domain + ': domains changed from ' + repr(source.domains) + ' -> ' + repr(domains))
            source.domains = domains
            dirty = True

        if 'rankings' in js and js['rankings']:
            if source.MozRankURL != MozRankURL:
                print(domain + ': MozRankURL changed from ' + repr(source.MozRankURL) + ' -> ' + repr(MozRankURL))
                source.MozRankURL = MozRankURL
                dirty = True
            if source.Timelastcrawled != Timelastcrawled:
                print(domain + ': Timelastcrawled changed from ' + repr(source.Timelastcrawled) + ' -> ' + repr(Timelastcrawled))
                source.Timelastcrawled = Timelastcrawled
                dirty = True
            if source.MozRankURLRaw != MozRankURLRaw:
                print(domain + ': MozRankURLRaw changed from ' + repr(source.MozRankURLRaw) + ' -> ' + repr(MozRankURLRaw))
                source.MozRankURLRaw = MozRankURLRaw
                dirty = True
            if source.HTTPStatusCode != HTTPStatusCode:
                print(domain + ': HTTPStatusCode changed from ' + repr(source.HTTPStatusCode) + ' -> ' + repr(HTTPStatusCode))
                source.HTTPStatusCode = HTTPStatusCode
                dirty = True
            if source.ExternalEquityLinks != ExternalEquityLinks:
                print(domain + ': ExternalEquityLinks changed from ' + repr(source.ExternalEquityLinks) + ' -> ' + repr(ExternalEquityLinks))
                source.ExternalEquityLinks = ExternalEquityLinks
                dirty = True
            if source.DomainAuthority != DomainAuthority:
                print(domain + ': DomainAuthority changed from ' + repr(source.DomainAuthority) + ' -> ' + repr(DomainAuthority))
                source.DomainAuthority = DomainAuthority
                dirty = True

        if dirty:
            source.updated_at = datetime.datetime.now()
            source.save()
