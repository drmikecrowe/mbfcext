import { faEye } from "~utils/elements/font-awesome"
import { LitElement, html } from "lit"
import { customElement, property } from "lit/decorators.js"
import { C_FOUND } from "../filter"

@customElement("mbfc-hide-control")
class HiddenDiv extends LitElement {
  @property()
  storyClass = ""
  @property()
  hiddenId = ""
  @property()
  count = 0
  @property()
  collapse = false

  render() {
    const spanId = `${this.storyClass}-span`
    const hideId = `${this.storyClass}-icon`
    const hideClasses = `mbfc mbfc-hide-ctrl mbfc-hide-ctrl${this.count}`
    const hide = this.collapse
      ? html`
          <div id="${hideId}" class="${hideClasses}" style="cursor: pointer" ${faEye}>
            <span id="${spanId}"> Show Anyway</span>
          </div>
        `
      : ""
    return html`<mbfc class="mbfcext ${C_FOUND}" id="${this.hiddenId}" .innerHTML="${hide}"></mbfc> `
  }
}
