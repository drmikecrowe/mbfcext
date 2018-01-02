chrome.options.opts.autoSave = false;

chrome.options.opts.title = 'Section';

chrome.options.opts.about = '<p>This extension is open-source, and is based here: <a href="https://github.com/drmikecrowe/mbfcext">Github Project Page</a></p>';

chrome.options.addTab('Introduction', [
  {type: 'html', html: `
<h3>Official Media Bias/Fact Check Extension</h3><p>Thank you for installing the&nbsp;<a href="https://drmikecrowe.github.io/mbfcext/">Official Media Bias/Fact Check Extension</a>! &nbsp;We appreciate you becoming part
    of our community.</p><p>Be informed as you read your Facebook feed. We are the most comprehensive media bias resource on the internet. There are currently 1100+ media sources listed in our database and growing every
    day. Don’t be fooled by Fake News sources.</p><h3>Release notes for version 1.0.15</h3>
<div>What's new this release:</div>
<div><br></div>
<div>Now showing more detailed information:&nbsp;<br>
    <ul>
        <li>1. Reporting: The reporting analysis by <a href="https://mediabiasfactcheck.com">Media Bias/Fact Check</a></li>
        <li>2. References: This is <a href="https://moz.com/learn/seo/what-is-link-equity">Moz's Link equity</a>, once colloquially referred to 
            with the awful term &quot;link juice,&quot; is a search engine ranking factor based on the idea that certain links pass value and authority 
            from one page to another. This value is dependent on a number of factors, such as the linking page's authority, topical relevance, 
            HTTP status, and more. Links that pass equity are one of many signals that Google and other search engines use to determine a page's 
            rankings in the SERPs.  Moz's Link Equity analysis.  </li>
        <li>3. Popularity: Of the 2000+ MBFC sites, this indicates the where this site falls in the continuum of sites analyzed.  Sites with few 
            References (Link Equity) are close to 0% in popularity.  Sites with 3M References are at 100%.  This percentage should help you determine 
            how seriously to take the site.
        </li>
        <li>4. Search:  This link opens a new window at our sister site <a href="https://factualsearch.news">https://factualsearch.news</a> and 
            tries to search for the tagline.  It should help you start your research into a specific topic and it's accuracy.
        </li>
    </ul>
    <div>New Features:</div>
</div>
<div>
    <ul>
        <li>5.  Now allow collapsing "Mixed" factual reporting sources</li>
    </ul>
</div><h3>Release notes for version 1.0.13</h3><p>We are very excited to announce a new feature: &nbsp;<strong><em>Collapsable News</em></strong><br></p>
<ul>
    <li>1. Click on the "Collapse" section on the left</li>
    <li>2. Choose which news categories to collapse in your feed</li>
    <li>3. Revel in the reduction in stress from your extreme FB friends</li>
</ul><br><h3>We Need Your Help!</h3><p>If you like this extension, please help us out:</p>
<ul>
    <li>Give us a favorable review in the <a href="https://chrome.google.com/webstore/detail/official-media-biasfact-c/ganicjnkcddicfioohdaegodjodcbkkh" target="_blank">Chrome Web Store</a>. &nbsp;This will help grow our
        users
    </li>
    <li>Please tell your friends. &nbsp;If you would like to share on Facebook, <a
            href="https://www.facebook.com/sharer/sharer.php?u=https%3A//chrome.google.com/webstore/detail/official-media-biasfact-c/ganicjnkcddicfioohdaegodjodcbkkh">click here now</a>.
    </li>
</ul>  
`}
]);

chrome.options.addTab('Collapse', 'Collapse Inappropriate Stories', [
  {type: 'h3', desc: 'Left Bias (We recommend collapsing)'},
  {
    name: 'collapse-left', type: 'select', default: 'show', options: [
    {value: 'show', desc: 'Show Left Bias'},
    {value: 'hide', desc: 'Hide Left Bias'},
  ],
    desc: 'These media sources are moderately to strongly biased toward liberal causes through story selection and&#x2F;or political affiliation.  They may utilize strong loaded words (wording that attempts to influence an audience by using appeal to emotion or stereotypes), publish misleading reports and omit reporting of information that may damage liberal causes. Some sources in this category may be untrustworthy.'
  },
  {type: 'h3', desc: 'Left-Center Bias '},
  {
    name: 'collapse-leftcenter', type: 'select', default: 'show', options: [
    {value: 'show', desc: 'Show Left-Center Bias'},
    {value: 'hide', desc: 'Hide Left-Center Bias'},
  ],
    desc: 'These media sources have a slight to moderate liberal bias.  They often publish factual information that utilizes loaded words (wording that attempts to influence an audience by using appeal to emotion or stereotypes) to favor liberal causes.  These sources are generally trustworthy for information, but may require further investigation.  '
  },
  {type: 'h3', desc: 'Least Biased '},
  {
    name: 'collapse-center', type: 'select', default: 'show', options: [
    {value: 'show', desc: 'Show Least Biased'},
    {value: 'hide', desc: 'Hide Least Biased'},
  ],
    desc: 'These sources have minimal bias and use very few loaded words (wording that attempts to influence an audience by using appeal to emotion or stereotypes).  The reporting is factual and usually sourced.  These are the most credible media sources.  '
  },
  {type: 'h3', desc: 'Right-Center Bias '},
  {
    name: 'collapse-right-center', type: 'select', default: 'show', options: [
    {value: 'show', desc: 'Show Right-Center Bias'},
    {value: 'hide', desc: 'Hide Right-Center Bias'},
  ],
    desc: 'These media sources are slightly to moderately conservative in bias. They often publish factual information that utilizes loaded words (wording that attempts to influence an audience by using appeal to emotion or stereotypes) to favor conservative causes. These sources are generally trustworthy for information, but may require further investigation.  '
  },
  {type: 'h3', desc: 'Right Bias (We recommend collapsing)'},
  {
    name: 'collapse-right', type: 'select', default: 'show', options: [
    {value: 'show', desc: 'Show Right Bias'},
    {value: 'hide', desc: 'Hide Right Bias'},
  ],
    desc: 'These media sources are moderately to strongly biased toward conservative causes through story selection and&#x2F;or political affiliation. They may utilize strong loaded words (wording that attempts to influence an audience by using appeal to emotion or stereotypes), publish misleading reports and omit reporting of information that may damage conservative causes. Some sources in this category may be untrustworthy.'
  },
  {type: 'h3', desc: 'Pro-Science '},
  {
    name: 'collapse-pro-science', type: 'select', default: 'show', options: [
    {value: 'show', desc: 'Show Pro-Science'},
    {value: 'hide', desc: 'Hide Pro-Science'},
  ],
    desc: 'These sources consist of legitimate science or are evidence based through the use of credible scientific sourcing.  Legitimate science follows the scientific method, is unbiased and does not use emotional words.  These sources also respect the consensus of experts in the given scientific field and strive to publish peer reviewed science. Some sources in this category may have a slight political bias, but adhere to scientific principles.'
  },
  {type: 'h3', desc: 'Conspiracy-Pseudoscience (We recommend collapsing)'},
  {
    name: 'collapse-conspiracy', type: 'select', default: 'show', options: [
    {value: 'show', desc: 'Show Conspiracy-Pseudoscience'},
    {value: 'hide', desc: 'Hide Conspiracy-Pseudoscience'},
  ],
    desc: 'Sources in the Conspiracy-Pseudoscience category “may” publish unverifiable information that is “not always” supported by evidence. These sources “may” be untrustworthy for credible&#x2F;verifiable information, therefore fact checking and further investigation is recommended on a per article basis when obtaining information from these sources. '
  },
  {type: 'h3', desc: 'Satire '},
  {
    name: 'collapse-satire', type: 'select', default: 'show', options: [
    {value: 'show', desc: 'Show Satire'},
    {value: 'hide', desc: 'Hide Satire'},
  ],
    desc: 'These sources exclusively use humor, irony, exaggeration, or ridicule to expose and criticize people’s stupidity or vices, particularly in the context of contemporary politics and other topical issues. Primarily these sources are clear that they are satire and do not attempt to deceive.'
  },
  {type: 'h3', desc: 'Questionable Sources (We recommend collapsing)'},
  {
    name: 'collapse-fake-news', type: 'select', default: 'show', options: [
    {value: 'show', desc: 'Show Questionable Sources'},
    {value: 'hide', desc: 'Hide Questionable Sources'},
  ],
    desc: 'A questionable source exhibits any of the following: extreme bias, overt propaganda, poor or no sourcing to credible information and&#x2F;or is fake news. Fake News is the deliberate attempt to publish hoaxes and&#x2F;or disinformation for the purpose of profit or influence (Learn More). Sources listed in the Questionable Category may be very untrustworthy and should be fact checked on a per article basis. '
  },
  {type: 'h3', desc: 'Mixed Factual Reporting (We recommend collapsing)'},
  {
    name: 'collapse-mixed', type: 'select', default: 'show', options: [
      {value: 'show', desc: 'Show Mixed Factual-reporting Sources'},
      {value: 'hide', desc: 'Hide Mixed Factual-reporting Sources'},
    ],
    desc: 'A questionable source exhibits any of the following: extreme bias, overt propaganda, poor or no sourcing to credible information and&#x2F;or is fake news. Fake News is the deliberate attempt to publish hoaxes and&#x2F;or disinformation for the purpose of profit or influence (Learn More). Sources listed in the Questionable Category may be very untrustworthy and should be fact checked on a per article basis. '
  },

]);

chrome.options.addTab('Privacy Settings', [
  {type: 'html', html: '<label> This extension may collect <b>anonymous</b> usage data to help improve the results provided. The events are: </label><ul><li>Domains that are NOT rated by <a href="https://mediabiasfactcheck.com" target="_blank">Media Bias Fact Check</a>. Highly viewed, unranked sites will be recommended for analysis</li><li>Site ratings shown, such as LEFT, LEFT-CENTER, LEAST, RIGHT-CENTER, RIGHT</li><li>Getting more details from <a href="https://mediabiasfactcheck.com" target="_blank">Media Bias Fact Check</a> on a site</li><li>Sites that are ignored</li></ul>'},
  {
    name: 'mbfcanalytics_disabled', default: false,
    desc: 'Disable anonymous usage reporting'
  },
]);

chrome.options.addTab('Ignored Sites', [
  {type: 'h3', desc: 'Want to clear your ignore list?'},
  {
    name: 'reset_ignored', default: false,
    desc: 'Reset ignored sites'
  },
]);

chrome.options.addTab('Donate', [
  {type: 'html', html: '<p>We would greatly appreciate any donations you are willing to give (especially recurring ones!). &nbsp;Maintaining this extension and adding new features takes a fair amount of time, and donations help encourage more benefits and features.</p>' +
                       '<p>You can donate in multiple ways:</p>' +
                       '<ul>' +
                       '<li>Via <a href="https://paypal.me/drmikecrowe" target="_blank">PayPal</a></li>' +
                       '<li>Via <a href="https://www.patreon.com/solvedbymike" target="_blank">Patreon</a></li>' +
                       '</ul>  '}
]);

