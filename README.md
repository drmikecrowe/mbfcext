# Official Media Bias/Fact Check Extension

## Latest News

### New in version 4.1

- **Facebook feed annotation restored** — Bias badges now appear correctly on news posts after Facebook's recent DOM changes
- **News Search button** — Search for more information about any article directly from the bias badge (can be disabled in settings)
- **Performance improvements** — Debounced MutationObserver processing for better efficiency

### Version 4.0 Highlights

- **Sponsored story controls** — Option to collapse or hide sponsored stories in your feed
- **Removed Twitter/X support** — Due to platform API changes
- **Modern extension architecture** — Upgraded to Plasmo framework with Manifest v3

### New Support Channel

While the subreddit will still be active, we will be shifting our primary support to our [Facebook Page](https://www.facebook.com/mbfcext).

## Build Instructions

See [BUILD.md](BUILD.md) documentation

## Introduction

Thank you for installing the [Official Media Bias/Fact Check Extension](https://drmikecrowe.github.io/mbfcext/)!  We appreciate you installing our extension!

Be informed as you read your Facebook feed. We are the most comprehensive media bias resource on the internet. There are currently 1100+ media sources listed in our database and growing every day. Don’t be fooled by Fake News sources. This extension is completely open source, and the source code is hosted [here](https://github.com/drmikecrowe/mbfcext).

If you find any issues with this extension, ideas of ways to make it better or simply want to discuss it, we have the [r/MediaBiasFactCheck subreddit](https://www.reddit.com/r/MediaBiasFactCheck/) available.

## We Need Your Help!

If you like this extension, please help us out:

- Give us a favorable review in the [Chrome Web Store](https://chromewebstore.google.com/detail/media-bias-fact-check/ganicjnkcddicfioohdaegodjodcbkkh) or the [Firefox Addons Page](https://addons.mozilla.org/en-US/firefox/addon/media-bias-fact-check/).  This will help grow our users
- Please tell your friends.  If you would like to share on Facebook, [click here now](https://www.facebook.com/sharer/sharer.php?u=https%3A//chromewebstore.google.com/detail/media-bias-fact-check/ganicjnkcddicfioohdaegodjodcbkkh).

## Release Notes for version 4.1

- Restored Facebook feed annotation after Facebook's DOM changes
- Added News Search button for researching articles (configurable)
- Upgraded to Node 24 and modern TypeScript 5.9
- Debounced MutationObserver for better performance
- Added Google Analytics tracking for feature usage

## Release Notes for version 4.0

- Upgraded to Node 18
- Migrated to using Plasmo as the extension foundation
- Upgraded to manifest v3
- Upgraded google analytics to v4

## Release notes for version 3.0

- Now support the new Facebook layout
- Major overhall of code
- Now have the ability to target Firefox and Opera for extensions

## Release notes for version 2.0

### Now Showing Bias Icon for Reported Sites

- Browse to a site reviewed by Media Bias/Fact Check and the extension icon will now change to the bias of the site
- If you have collapsed the site in settings, that icon will flash to get your attention

### Twitter Support!

- [Twitter](https://twitter.com) feed is now annotated with a basic MBFC review for reported site. Please let us know what you think via a comment in the [Chrome Web Store](https://chromewebstore.google.com/detail/media-bias-fact-check/ganicjnkcddicfioohdaegodjodcbkkh)

## Release notes for version 1.0.15

### Now showing more detailed information: 

- Reporting: The reporting analysis by [Media Bias/Fact Check](https://mediabiasfactcheck.com)
- References: This is [Moz's Link equity](https://moz.com/learn/seo/what-is-link-equity), once colloquially referred to with the awful term "link juice," is a search engine ranking factor based on the idea that certain links pass value and authority from one page to another. This value is dependent on a number of factors, such as the linking page's authority, topical relevance, HTTP status, and more. Links that pass equity are one of many signals that Google and other search engines use to determine a page's rankings in the SERPs. Moz's Link Equity analysis.
- Popularity: Of the 2000+ MBFC sites, this indicates the where this site falls in the continuum of sites analyzed. Sites with few References (Link Equity) are close to 0% in popularity. Sites with 3M References are at 100%. This percentage should help you determine how seriously to take the site.
- Search: This link opens a new window at our sister site [https://factualsearch.news](https://factualsearch.news) and tries to search for the tagline. It should help you start your research into a specific topic and it's accuracy.

### New Features:

- Now allow collapsing "Mixed" factual reporting sources

## Release notes for version 1.0.13

We are very excited to announce a new feature:  **_Collapsable News_**

- Click on the "Collapse" section on the left
- Choose which news categories to collapse in your feed
- Revel in the reduction in stress from your extreme FB friends
