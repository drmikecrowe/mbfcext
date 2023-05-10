import { LitElement, css, html } from "lit"
import { customElement, property } from "lit/decorators.js"
import { BiasEnums } from "~models/combined-manager"
import { cap } from "../../../utils/cap"


@customElement("mbfc-news-annotation")
class NewsAnnotation extends LitElement {
  @property() 
  bias: string
  @property() 
  reporting: string | undefined
  @property() 
  credibility: string | undefined
  @property() 
  traffic: string | undefined
  @property() 
  popularity: string | undefined
  @property() 
  domain: string 

  static get styles() {
    return css`
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
    `
  }

  getGradient() {
    const biasText = cap(this.bias);

    const biasDetails = {
      [BiasEnums.Left]: { biasStart: 0, biasEnd: 20 },
      [BiasEnums.LeftCenter]: { biasStart: 20, biasEnd: 40 },
      [BiasEnums.Center]: { biasStart: 40, biasEnd: 60 },
      [BiasEnums.RightCenter]: { biasStart: 60, biasEnd: 80 },
      [BiasEnums.Right]: { biasStart: 80, biasEnd: 100 },
      [BiasEnums.ConspiracyPseudoscience]: { biasStart: 30, biasEnd: 70, rowClass: "mbfc-caution-row", textClass: "mbfc-black-text" },
      [BiasEnums.FakeNews]: { biasStart: 40, biasEnd: 60, rowClass: "mbfc-caution-row", textClass: "mbfc-black-text" },
      [BiasEnums.ProScience]: { biasStart: 40, biasEnd: 60, rowClass: "mbfc-science-row", textClass: "mbfc-white-text" },
      [BiasEnums.Satire]: { biasStart: 40, biasEnd: 60, rowClass: "mbfc-satire-row", textClass: "mbfc-black-text" }
    };
    
    const { biasStart, biasEnd, rowClass = "mbfc-gradient-row", textClass = `mbfc-gradient-text-${this.bias}` } = biasDetails[this.bias];
    
    return html`
      <div class="${rowClass} mbfc-common-row">
        <div style="width: ${biasStart}%"></div>
        <div class="mbfc-gradient-text ${textClass}">${biasText}</div>
        <div style="width: ${100 - biasEnd}%"></div>
      </div>`
  }
 
  render() {
    let reportingDiv = html``;
    let credibilityDiv = html``;
    let trafficDiv = html``;
    let popularityDiv = html``;
    let researchDiv = html``;
    let mbfcDiv = html``;
  
    if (this.reporting) {
      reportingDiv = html`<div class="mbfc-gradient-text mbfc-black-text">${cap(this.reporting)} Reporting</div>`;
    }
  
    if (this.credibility) {
      credibilityDiv = html`<div class="mbfc-gradient-text mbfc-black-text">${cap(this.credibility)}</div>`;
    }
  
    if (this.traffic) {
      trafficDiv = html`<div class="mbfc-gradient-text mbfc-black-text">${cap(this.traffic)}</div>`;
    }
  
    if (this.popularity) {
      popularityDiv = html`<div class="mbfc-gradient-text mbfc-black-text">Links: ${cap(this.popularity)}</div>`;
    }
  
    if (this.domain) {
      researchDiv = html`<div class="mbfc-gradient-text mbfc-black-text"><a href="${this.domain}" target="_blank">Research</a></div>`;
      mbfcDiv = html`<div class="mbfc-gradient-text mbfc-black-text"><a href="${this.domain}" target="_blank">MBFC</a></div>`;
    }
  
    return html`
      <div class="mbfc-annotation-container">
        <div class="mbfc-annotation-row">
          ${this.getGradient()}
        </div>
        <div class="mbfc-annotation-row">
          ${reportingDiv}
          ${credibilityDiv}
          ${trafficDiv}
          ${popularityDiv}
          ${researchDiv}
          ${mbfcDiv}
        </div>
      </div>
    `;
  }
  
}

declare global {
  interface HTMLElementTagNameMap {
    'mbfc-news-annotation': NewsAnnotation
  }
}