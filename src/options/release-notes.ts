/**
 * Release Notes tab content - Creates DOM elements directly without innerHTML
 */

interface Section {
  title: string
  items: string[]
}

function createSection(sections: { title: string; items: string[] }[]): HTMLDivElement {
  const div = document.createElement("div")

  // Main title
  const h1 = document.createElement("h1")
  h1.id = "official-media-bias-fact-check-extension-release-notes"
  h1.textContent = "Official Media Bias/Fact Check Extension Release Notes"
  div.appendChild(h1)

  sections.forEach((section) => {
    const h2 = document.createElement("h2")
    h2.id = section.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-$/, "")
    h2.textContent = section.title
    div.appendChild(h2)

    const ul = document.createElement("ul")
    section.items.forEach((item) => {
      const li = document.createElement("li")
      // Handle bold text within items
      const parts = item.split(/(\*\*[^*]+\*\*)/g)
      parts.forEach((part) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          const strong = document.createElement("strong")
          strong.textContent = part.slice(2, -2)
          li.appendChild(strong)
        } else if (part) {
          li.appendChild(document.createTextNode(part))
        }
      })
      ul.appendChild(li)
    })
    div.appendChild(ul)
  })

  return div
}

export function renderReleaseNotes(containerId: string): void {
  const container = document.getElementById(containerId)
  if (!container) return

  // Clear container
  while (container.firstChild) {
    container.removeChild(container.firstChild)
  }

  const sections = [
    {
      title: "Release notes for version 4.1",
      items: [
        "**Facebook feed annotation restored** — Bias badges now appear correctly on news posts in your Facebook feed after Facebook's recent changes",
        "**News Search button** — Search for more information about any news article directly from the bias badge (can be disabled in Options)",
        "Performance and stability improvements",
      ],
    },
    {
      title: "Release notes for version 4.0",
      items: [
        "**Sponsored story controls** — New option to collapse or hide sponsored stories in your feed",
        "Removed Twitter/X support due to platform API changes",
        "Upgraded to modern extension architecture for better reliability",
      ],
    },
    {
      title: "Release notes for version 3.3.0",
      items: ["Changing to browserAction to allow separate windows to have separate icons"],
    },
    {
      title: "Release notes for version 3.2.1",
      items: ["Fixing finding subdomains such as nhk.or.jp/nhkworld/article..", "Adding jest test frameworks"],
    },
    {
      title: "Release notes for version 3.2",
      items: ["Improved article detection"],
    },
    {
      title: "Release notes for version 3.1",
      items: ["Adding support for Credibility and Traffic", "Fixing issue with hiding/showing a site permanently", "Adding version number to config"],
    },
    {
      title: "Release notes for version 3.0",
      items: ["Now support the new Facebook layout", "Major overhall of code", "Now have the ability to target Firefox and Opera for extensions"],
    },
    {
      title: "Release notes for version 2.0",
      items: [
        "Browse to a site reviewed by Media Bias/Fact Check and the extension icon will now change to the bias of the site",
        "If you have collapsed the site in settings, that icon will flash to get your attention",
      ],
    },
    {
      title: "Release notes for version 1.0.15",
      items: [
        "Reporting: The reporting analysis by Media Bias/Fact Check",
        "References: This is Moz's Link equity analysis for search engine ranking",
        "Popularity: Indicates where this site falls in the continuum of sites analyzed by MBFC",
        "Search: Opens a search on factualsearch.news for the article topic",
      ],
    },
    {
      title: "Release notes for version 1.0.13",
      items: [
        "New feature: Collapsable News",
        "Click on the Collapse section on the left",
        "Choose which news categories to collapse in your feed",
        "Revel in the reduction in stress from your extreme FB friends",
      ],
    },
  ]

  const content = createSection(sections)
  container.appendChild(content)
}
