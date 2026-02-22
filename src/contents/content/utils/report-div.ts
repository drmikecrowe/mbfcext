import htm from "htm"
import vhtml from "vhtml"

import { BiasEnums, CredibilityEnums, type SiteModel, TrafficEnums } from "~models/combined-manager"
import { cap } from "~shared/cap"
import { faAngleDoubleDown } from "~shared/elements/font-awesome"

const html = htm.bind(vhtml)
const icon = (url: string) => html([url] as ReadonlyArray<string> as TemplateStringsArray)

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
  count: number
  collapse: boolean

  constructor(site: SiteModel, parent: HTMLElement, count: number, collapse: boolean) {
    this.site = site
    this.parent = parent
    this.count = count
    this.collapse = collapse
  }

  static get styles() {
    return `
      .mbfc-dropdown-button {
        flex: 1; 
        width: 33%; 
        text-align: center; 
        border-radius: 20px;
        padding: 5px;
      }
      .mbfc-icon-svg {
        color: white;
        cursor: pointer;
        height: 10px;
        width: 10px;
        float: right;
        margin-left: 10px;
      }
      .mbfc-fa-icon {
        font-family: FontAwesome, Arial, sans-serif;
        font-size: smaller;
        font-weight: 600;
        width: 10px;
      }
      .mbfc-annotation-container {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        justify-content: center;
        padding: 10px;
        border-radius: 5px;
        margin-bottom: 10px;
        width: 100%;
        box-sizing: border-box;
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
      .mbfc-button-success,
      .mbfc-button-error,
      .mbfc-button-warning,
      .mbfc-button-secondary {
          color: white;
          border-radius: 4px;
          text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
      }
      
      .mbfc-button-success {
          background: rgb(28, 184, 65); /* this is a green */
      }
      
      .mbfc-button-error {
          background: rgb(202, 60, 60); /* this is a maroon */
      }
      
      .mbfc-button-warning {
          background: rgb(223, 117, 20); /* this is an orange */
      }
      
      .mbfc-button-secondary {
          background: rgb(66, 184, 221); /* this is a light blue */
      }

      .mbfc-text-buffer {
        margin-left: 10px;
      }
    `
  }

  static load_styles() {
    if (!NewsAnnotation.loaded) {
      NewsAnnotation.loaded = true
      const style = document.createElement("style")
      style.innerHTML = NewsAnnotation.styles
      document.head.appendChild(style)
    }
  }

  // Convert this inline code to a function.  Insert that function like load_styles above.  The this.count will need to be parameter of the function const inlineCode = `let el=document.getElementById("mbfc-story-toolbar-${this.count}"); el.style.display=el.style.display==='none'?"flex":"none"`

  render() {
    NewsAnnotation.load_styles()

    let reportingDiv = ``
    let credibilityDiv = ``
    let trafficDiv = ``
    let popularityDiv = ``
    const researchDiv = ``
    let mbfcDiv = ``

    const tweak = (c: string) => (c === "Center" ? "Least Biased" : c === "Fake News" ? "Questionable" : c)

    if (this.site.reporting) {
      reportingDiv = html`<div className="mbfc-gradient-text mbfc-black-text">${cap(this.site.reporting)} Reporting</div>` as string
    }

    if (this.site.credibility && this.site.credibility !== CredibilityEnums.NA) {
      credibilityDiv = html`<div className="mbfc-gradient-text mbfc-black-text mbfc-text-buffer">${cap(this.site.credibility)}</div>` as string
    }

    if (this.site.traffic && this.site.traffic !== TrafficEnums.NoData) {
      trafficDiv = html`<div className="mbfc-gradient-text mbfc-black-text mbfc-text-buffer">${cap(this.site.traffic)}</div>` as string
    }

    if (this.site.popularity) {
      popularityDiv = html`<div className="mbfc-gradient-text mbfc-black-text mbfc-text-buffer">Links: ${this.site.popularity}%</div>` as string
    }

    if (this.site.domain) {
      console.log(this.site)
      mbfcDiv = html`<div className="mbfc-gradient-text mbfc-black-text mbfc-text-buffer"><a href="${this.site.url}" target="_blank">MBFC</a></div>` as string
    }
    const biasText = cap(this.site.bias)

    const { biasStart, biasEnd, rowClass = "mbfc-gradient-row", textClass = `mbfc-gradient-text-${this.site.bias}` } = biasDetails[this.site.bias]

    const prompt = this.collapse ? "Show" : "Hide"

    return html`
      <div className="mbfc-annotation-container">
        <div className="mbfc-annotation-row">
          <div className="${rowClass} mbfc-common-row">
            <div className="mbfc-bias-start-${biasStart}"></div>
            <div className="${textClass} mbfc-gradient-text">${tweak(biasText)}</div>
            <div className="mbfc-bias-end-${biasEnd}">
              <div
                class="mbfc-dropdown-toggle"
                data-attached="false"
                data-count="${this.count}"
                data-domain="${this.site.domain}"
                style="cursor: pointer;">${icon(faAngleDoubleDown)}</div>
            </div>
          </div>
        </div>
        <div id="mbfc-story-expanded-${this.count}" style="display: none">
          <div style="display: flex; justify-content: space-between; width: 100%;">
            <button
              id="mbfc-toolbar-button1-${this.count}"
              class="mbfc-toolbar-button mbfc-drop-down mbfc-button-success mbfc-dropdown-button"
              data-attached="false"
              data-type="ignore"
              data-count="${this.count}"
              data-domain="${this.site.domain}"
              data-collapse="${prompt}">
              Always ${prompt} ${this.site.domain}
            </button>
            <button
              id="mbfc-toolbar-button2-${this.count}"
              class="mbfc-toolbar-button mbfc-drop-down mbfc-button-warning mbfc-dropdown-button"
              data-attached="false"
              data-type="reset">
              Reset Hidden Sites
            </button>
            <button
              id="mbfc-toolbar-button3-${this.count}"
              class="mbfc-toolbar-button mbfc-drop-down mbfc-button-secondary mbfc-dropdown-button"
              data-attached="false"
              data-type="thanks">
              Say Thanks
            </button>
          </div>
          <div className="mbfc-annotation-row">${reportingDiv} ${credibilityDiv} ${trafficDiv} ${popularityDiv} ${researchDiv} ${mbfcDiv}</div>
        </div>
      </div>
    `
  }
}
