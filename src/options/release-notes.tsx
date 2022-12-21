export default function ReleaseNotes() {
  return (
    <div>
      <h1 id="official-media-bias-fact-check-extension-release-notes">Official Media Bias/Fact Check Extension Release Notes</h1>
      <h2 id="release-notes-for-version-3-3-0">Release notes for version 3.3.0</h2>
      <ul>
        <li>Changing to browserAction to allow separate windows to have separate icons</li>
      </ul>
      <h2 id="release-notes-for-version-3-2-1">Release notes for version 3.2.1</h2>
      <ul>
        <li>Fixing finding subdomains such as nhk.or.jp/nhkworld/article..</li>
        <li>Adding jest test frameworks</li>
      </ul>
      <h2 id="release-notes-for-version-3-2">Release notes for version 3.2</h2>
      <ul>
        <li>Improving Twitter article detection</li>
        <li>Placing MBFC insert below image if we use the Twitter handle, and under the article if we use the article domain</li>
      </ul>
      <h2 id="release-notes-for-version-3-1">Release notes for version 3.1</h2>
      <ul>
        <li>Adding support for Credibility and Traffic</li>
        <li>Fixing issue with hiding/showing a site permanently</li>
        <li>Adding version number to config</li>
      </ul>
      <h2 id="release-notes-for-version-3-0">Release notes for version 3.0</h2>
      <ul>
        <li>Now support the new Facebook layout</li>
        <li>Major overhall of code</li>
        <li>Now have the ability to target Firefox and Opera for extensions</li>
      </ul>
      <h2 id="release-notes-for-version-2-0">Release notes for version 2.0</h2>
      <h3 id="now-showing-bias-icon-for-reported-sites">Now Showing Bias Icon for Reported Sites</h3>
      <ul>
        <li>Browse to a site reviewed by Media Bias/Fact Check and the extension icon will now change to the bias of the site</li>
        <li>If you have collapsed the site in settings, that icon will flash to get your attention</li>
      </ul>
      <h3 id="twitter-support-">Twitter Support!</h3>
      <ul>
        <li>
          <a href="https://twitter.com">Twitter</a> feed is now annotated with a basic MBFC review for reported site.
        </li>
      </ul>
      <h2 id="release-notes-for-version-1-0-15">Release notes for version 1.0.15</h2>
      <h3 id="now-showing-more-detailed-information-">Now showing more detailed information:</h3>
      <ul>
        <li>
          Reporting: The reporting analysis by <a href="https://mediabiasfactcheck.com">Media Bias/Fact Check</a>
        </li>
        <li>
          References: This is <a href="https://moz.com/learn/seo/what-is-link-equity">Moz&#39;s Link equity</a>, once colloquially referred to with the awful term &quot;link
          juice,&quot; is a search engine ranking factor based on the idea that certain links pass value and authority from one page to another. This value is dependent on a number
          of factors, such as the linking page&#39;s authority, topical relevance, HTTP status, and more. Links that pass equity are one of many signals that Google and other
          search engines use to determine a page&#39;s rankings in the SERPs. Moz&#39;s Link Equity analysis.
        </li>
        <li>
          Popularity: Of the 2000+ MBFC sites, this indicates the where this site falls in the continuum of sites analyzed. Sites with few References (Link Equity) are close to 0%
          in popularity. Sites with 3M References are at 100%. This percentage should help you determine how seriously to take the site.
        </li>
        <li>
          Search: This link opens a new window at our sister site <a href="https://factualsearch.news">https://factualsearch.news</a> and tries to search for the tagline. It should
          help you start your research into a specific topic and it&#39;s accuracy.
        </li>
      </ul>
      <h3 id="new-features-">New Features:</h3>
      <ul>
        <li>Now allow collapsing &quot;Mixed&quot; factual reporting sources</li>
      </ul>
      <h2 id="release-notes-for-version-1-0-13">Release notes for version 1.0.13</h2>
      <p>
        We are very excited to announce a new feature:{" "}
        <strong>
          <em>Collapsable News</em>
        </strong>
      </p>
      <ul>
        <li>Click on the &quot;Collapse&quot; section on the left</li>
        <li>Choose which news categories to collapse in your feed</li>
        <li>Revel in the reduction in stress from your extreme FB friends</li>
      </ul>
    </div>
  )
}
