import htm from "htm"
import vhtml from "vhtml"

import { BiasEnums, CredibilityEnums, type SiteModel, TrafficEnums } from "~models/combined-manager"
import { cap } from "~shared/cap"

const html = htm.bind(vhtml)

const biasDetails: any = {
  [BiasEnums.Left]: { biasStart: 0, biasEnd: 20 },
  [BiasEnums.LeftCenter]: { biasStart: 20, biasEnd: 40 },
  [BiasEnums.Center]: { biasStart: 40, biasEnd: 60 },
  [BiasEnums.RightCenter]: { biasStart: 60, biasEnd: 80 },
  [BiasEnums.Right]: { biasStart: 80, biasEnd: 100 },
  [BiasEnums.ConspiracyPseudoscience]: { biasStart: 30, biasEnd: 70, rowClass: "mbfc-caution-row", textClass: "mbfc-black-text" },
  [BiasEnums.FakeNews]: { biasStart: 40, biasEnd: 60, rowClass: "mbfc-caution-row", textClass: "mbfc-black-text" },
  [BiasEnums.ProScience]: { biasStart: 40, biasEnd: 60, rowClass: "mbfc-science-row", textClass: "mbfc-white-text" },
  [BiasEnums.Satire]: { biasStart: 40, biasEnd: 60, rowClass: "mbfc-satire-row", textClass: "mbfc-black-text" },
}

export class NewsAnnotation {
  static loaded = false

  site: SiteModel
  parent: HTMLElement

  constructor(site: SiteModel, parent: HTMLElement) {
    this.site = site
    this.parent = parent
  }

  static get styles() {
    return `
      .mbfc-annotation-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 10px;
        border-radius: 5px;
        margin-bottom: 10px;
      }

      .mbfc-caution-row {
        background-color: yellow;
      }

      .mbfc-science-row {
        background-color: green;
      }

      .mbfc-satire-row {
        background-color: lightgreen;
      }

      .mbfc-gradient-row {
        background: linear-gradient(to right, blue, white, red);
      }

      .mbfc-common-row {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        padding: 1px;
        border-radius: 5px;
        margin-bottom: 10px;
        width: 100%;
      }

      .mbfc-gradient-text {
        font-family: Helvetica, Arial, sans-serif;
        font-size: smaller;
        font-weight: 600;
        margin-right: 10px;
      }

      .mbfc-gradient-text-left, .mbfc-gradient-text-right, .mbfc-white-text {
        color: white;
      }

      .mbfc-gradient-text-left {
        margin-left: 0;
      }

      .mbfc-gradient-text-right {
        margin-right: 0;
      }

      .mbfc-gradient-text-left-center, .mbfc-gradient-text-right-center, .mbfc-gradient-text-center, mbfc-gradient-text-conspiracy-pseudoscience, mbfc-gradient-text-fake-news, mbfc-gradient-text-pro-science, .mbfc-black-text {
        color: black;
      }

      .mbfc-annotation-row {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        font-size: 12px;
        color: #ccc;
        margin-bottom: -8px;
      }

      .mbfc-bias-start-0 {
        width: 0%;
      }
      .mbfc-bias-start-20 {
        width: 20%;
      }
      .mbfc-bias-start-40 {
        width: 40%;
      }
      .mbfc-bias-start-60 {
        width: 60%;
      }
      .mbfc-bias-start-80 {
        width: 80%;
      }
      .mbfc-bias-end-20 {
        width: 80%;
      }
      .mbfc-bias-end-40 {
        width: 60%;
      }
      .mbfc-bias-end-60 {
        width: 40%;
      }
      .mbfc-bias-end-80 {
        width: 20%;
      }
      .mbfc-bias-end-100 {
        width: 0%;
      }
    `
  }

  render() {
    if (!NewsAnnotation.loaded) {
      NewsAnnotation.loaded = true
      const style = document.createElement("style")
      style.innerHTML = NewsAnnotation.styles
      document.head.appendChild(style)
    }

    let reportingDiv = ``
    let credibilityDiv = ``
    let trafficDiv = ``
    let popularityDiv = ``
    let researchDiv = ``
    let mbfcDiv = ``

    if (this.site.reporting) {
      reportingDiv = html`<div className="mbfc-gradient-text mbfc-black-text">${cap(this.site.reporting)} Reporting</div>` as string
    }

    if (this.site.credibility && this.site.credibility !== CredibilityEnums.NA) {
      credibilityDiv = html`<div className="mbfc-gradient-text mbfc-black-text">${cap(this.site.credibility)}</div>` as string
    }

    if (this.site.traffic && this.site.traffic !== TrafficEnums.NoData) {
      trafficDiv = html`<div className="mbfc-gradient-text mbfc-black-text">${cap(this.site.traffic)}</div>` as string
    }

    if (this.site.popularity) {
      popularityDiv = html`<div className="mbfc-gradient-text mbfc-black-text">Links: ${this.site.popularity}%</div>` as string
    }

    if (this.site.domain) {
      researchDiv = html`<div className="mbfc-gradient-text mbfc-black-text"><a href="${this.site.domain}" target="_blank">Research</a></div>` as string
      mbfcDiv = html`<div className="mbfc-gradient-text mbfc-black-text"><a href="${this.site.domain}" target="_blank">MBFC</a></div>` as string
    }
    const biasText = cap(this.site.bias)

    const { biasStart, biasEnd, rowClass = "mbfc-gradient-row", textClass = `mbfc-gradient-text-${this.site.bias}` } = biasDetails[this.site.bias]

    return html`
      <div className="mbfc-annotation-container">
        <div className="mbfc-annotation-row">
          <div className="${rowClass} mbfc-common-row">
            <div className="mbfc-bias-start-${biasStart}"></div>
            <div className="${textClass} mbfc-gradient-text">${biasText}</div>
            <div className="mbfc-bias-end-${biasEnd}"></div>
          </div>
        </div>
        <div className="mbfc-annotation-row">${reportingDiv} ${credibilityDiv} ${trafficDiv} ${popularityDiv} ${researchDiv} ${mbfcDiv}</div>
      </div>
    `
  }
}
