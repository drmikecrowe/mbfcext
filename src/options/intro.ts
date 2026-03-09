/**
 * Intro tab content - Creates DOM elements directly without innerHTML
 */

export function renderIntro(containerId: string): void {
  const container = document.getElementById(containerId)
  if (!container) return

  // Clear container
  while (container.firstChild) {
    container.removeChild(container.firstChild)
  }

  const div = document.createElement("div")

  // Title
  const h1 = document.createElement("h1")
  h1.textContent = "Media Bias/Fact Check Extension"
  div.appendChild(h1)

  // Description
  const p1 = document.createElement("p")
  const link1 = document.createElement("a")
  link1.href = "https://mediabiasfactcheck.com"
  link1.textContent = "Media Bias/Fact Check"
  p1.appendChild(document.createTextNode("This extension displays bias ratings from "))
  p1.appendChild(link1)
  p1.appendChild(document.createTextNode(" directly on Facebook news posts, helping you quickly assess source credibility."))
  div.appendChild(p1)

  // Features section
  const h2_features = document.createElement("h2")
  h2_features.textContent = "Features"
  div.appendChild(h2_features)

  const ul_features = document.createElement("ul")

  const features = [
    { bold: "Bias badges", text: " — Color-coded ratings appear on news posts in your Facebook feed" },
    { bold: "Domain lookup", text: " — Click the extension icon to see bias info for any site you're visiting" },
    { bold: "News search", text: " — Search for more information about any article with one click" },
    { bold: "Collapse filters", text: " — Automatically collapse stories from sources with specific bias or credibility ratings" },
    { bold: "Sponsored story control", text: " — Hide or collapse sponsored content in your feed" },
  ]

  features.forEach((feature) => {
    const li = document.createElement("li")
    const strong = document.createElement("strong")
    strong.textContent = feature.bold
    li.appendChild(strong)
    li.appendChild(document.createTextNode(feature.text))
    ul_features.appendChild(li)
  })

  div.appendChild(ul_features)

  // Get Started section
  const h2_started = document.createElement("h2")
  h2_started.textContent = "Get Started"
  div.appendChild(h2_started)

  const p_started = document.createElement("p")
  const strong_started = document.createElement("strong")
  strong_started.textContent = "Settings"
  p_started.appendChild(document.createTextNode("Visit the "))
  p_started.appendChild(strong_started)
  p_started.appendChild(document.createTextNode(" tab to configure which types of sources to collapse in your feed."))
  div.appendChild(p_started)

  // Feedback & Support section
  const h2_feedback = document.createElement("h2")
  h2_feedback.textContent = "Feedback & Support"
  div.appendChild(h2_feedback)

  const ul_feedback = document.createElement("ul")

  const feedbackLinks = [
    { text: "Facebook page", href: "https://www.facebook.com/mbfcext/", note: " — Questions and discussion" },
    { text: "Chrome Web Store", href: "https://chrome.google.com/webstore/detail/official-media-biasfact-c/ganicjnkcddicfioohdaegodjodcbkkh", note: " — Leave a review" },
    { text: "Firefox Add-ons", href: "https://addons.mozilla.org/en-US/firefox/addon/media-bias-fact-check/", note: " — Leave a review" },
  ]

  feedbackLinks.forEach((link) => {
    const li = document.createElement("li")
    const a = document.createElement("a")
    a.href = link.href
    a.textContent = link.text
    li.appendChild(a)
    li.appendChild(document.createTextNode(link.note))
    ul_feedback.appendChild(li)
  })

  div.appendChild(ul_feedback)

  container.appendChild(div)
}
