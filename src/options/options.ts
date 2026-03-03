/**
 * Options settings - checkboxes for collapse settings
 * Creates DOM elements directly without innerHTML to avoid UNSAFE_VAR_ASSIGNMENT warnings
 */

import { Storage } from "@plasmohq/storage"

import { logger } from "../shared/logger"
import { CollapseKeys } from "~shared/config-handler"

const log = logger("mbfc:options")

interface CheckboxConfig {
  label: string
  inputName: string
  hint: string
  help?: string
  default: boolean
}

const checkboxConfigs: CheckboxConfig[] = [
  {
    label: "Left Bias",
    inputName: CollapseKeys.collapseLeft,
    help: "(You should check this)",
    hint: "Left Bias media sources are moderately to strongly biased toward liberal causes through story selection and/or political affiliation. They may utilize strong loaded words (wording that attempts to influence an audience by using appeal to emotion or stereotypes), publish misleading reports and omit reporting of information that may damage liberal causes. Some sources in this category may be untrustworthy.",
    default: false,
  },
  {
    label: "Left-Center Bias",
    inputName: CollapseKeys.collapseLeftCenter,
    hint: "Left-Center media sources have a slight to moderate liberal bias. They often publish factual information that utilizes loaded words (wording that attempts to influence an audience by using appeal to emotion or stereotypes) to favor liberal causes. These sources are generally trustworthy for information, but may require further investigation.",
    default: false,
  },
  {
    label: "Least Biased",
    inputName: CollapseKeys.collapseCenter,
    hint: "Least Biased/Center media sources have minimal bias and use very few loaded words (wording that attempts to influence an audience by using appeal to emotion or stereotypes). The reporting is factual and usually sourced. These are the most credible media sources.",
    default: false,
  },
  {
    label: "Right-Center Bias",
    inputName: CollapseKeys.collapseRightCenter,
    hint: "Right-Center media sources are slightly to moderately conservative in bias. They often publish factual information that utilizes loaded words (wording that attempts to influence an audience by using appeal to emotion or stereotypes) to favor conservative causes. These sources are generally trustworthy for information, but may require further investigation.",
    default: false,
  },
  {
    label: "Right Bias",
    inputName: CollapseKeys.collapseRight,
    help: "(You should check this)",
    hint: "Right Bias media sources are moderately to strongly biased toward conservative causes through story selection and/or political affiliation. They may utilize strong loaded words (wording that attempts to influence an audience by using appeal to emotion or stereotypes), publish misleading reports and omit reporting of information that may damage conservative causes. Some sources in this category may be untrustworthy.",
    default: false,
  },
  {
    label: "Pro-Science",
    inputName: CollapseKeys.collapseProScience,
    hint: "Pro-Science media sources consist of legitimate science or are evidence based through the use of credible scientific sourcing. Legitimate science follows the scientific method, is unbiased and does not use emotional words. These sources also respect the consensus of experts in the given scientific field and strive to publish peer reviewed science. Some sources in this category may have a slight political bias, but adhere to scientific principles.",
    default: false,
  },
  {
    label: "Conspiracy-Pseudoscience",
    inputName: CollapseKeys.collapseConspiracy,
    help: "(You should check this)",
    hint: 'Sources in the Conspiracy-Pseudoscience category "may" publish unverifiable information that is "not always" supported by evidence. These sources "may" be untrustworthy for credible/verifiable information, therefore fact checking and further investigation is recommended on a per article basis when obtaining information from these sources.',
    default: true,
  },
  {
    label: "Satire",
    inputName: CollapseKeys.collapseSatire,
    hint: "Satire media sources exclusively use humor, irony, exaggeration, or ridicule to expose and criticize people's stupidity or vices, particularly in the context of contemporary politics and other topical issues. Primarily these sources are clear that they are satire and do not attempt to deceive.",
    default: false,
  },
  {
    label: "Questionable Sources/Fake News",
    inputName: CollapseKeys.collapseFakeNews,
    help: "(You should check this)",
    hint: "Questionable Sources/Fake News media source exhibits any of the following: extreme bias, overt propaganda, poor or no sourcing to credible information and/or is fake news. Fake News is the deliberate attempt to publish hoaxes and/or disinformation for the purpose of profit or influence (Learn More). Sources listed in the Questionable Category may be very untrustworthy and should be fact checked on a per article basis.",
    default: true,
  },
  {
    label: "Mixed Factual Reporting",
    inputName: CollapseKeys.collapseMixed,
    help: "(You should check this)",
    hint: "Mixed Factual Reporting media sources have a track record of publishing false stories, and should be treated used with caution.",
    default: false,
  },
  {
    label: "Sponsored ads",
    inputName: CollapseKeys.collapseSponsored,
    help: "(Check this if you hate Facebook marketing to you)",
    hint: "Sponsored ads typically annoy users. This option will collapse the ads.",
    default: false,
  },
]

const privacyConfigs: CheckboxConfig[] = [
  {
    label: "Disable anonymous usage reporting",
    inputName: "mbfcBlockAnalytics",
    hint: "This extension may collect anonymous usage data to help improve the extension. The events are: Domains that are NOT rated by Media Bias Fact Check (highly viewed, unranked sites will be recommended for analysis), Site ratings shown, Getting more details from Media Bias Fact Check on a site, Searching a site using factualsearch.news on a topic, Sites that are ignored.",
    default: false,
  },
  {
    label: "Disable News Search button on Facebook",
    inputName: "disableNewsSearchButton",
    hint: 'When enabled, hides the "News Search" button that appears next to "See more" on Facebook posts. This button searches post text on factualsearch.news.',
    default: false,
  },
]

function createCheckbox(config: CheckboxConfig, storage: Storage): HTMLDivElement {
  const wrapper = document.createElement("div")
  wrapper.className = "mb-4"

  const flexDiv = document.createElement("div")
  flexDiv.className = "md:flex md:items-center mb-6"

  const label = document.createElement("label")
  label.className = "block font-bold mr-2"
  label.htmlFor = config.inputName

  const checkbox = document.createElement("input")
  checkbox.type = "checkbox"
  checkbox.id = config.inputName
  checkbox.name = config.inputName
  checkbox.className = "form-checkbox border bg-red-100 border-red-300 text-red-500 focus:ring-red-200"

  // Load initial value from storage
  storage.get(config.inputName).then((value) => {
    // Handle both raw booleans and JSON-stringified values
    if (value === undefined || value === null) {
      checkbox.checked = config.default
    } else if (typeof value === "boolean") {
      checkbox.checked = value
    } else if (typeof value === "string") {
      // Handle JSON-stringified values from persist()
      try {
        checkbox.checked = JSON.parse(value)
      } catch {
        checkbox.checked = config.default
      }
    } else {
      checkbox.checked = config.default
    }
  })

  // Handle changes
  checkbox.addEventListener("change", async () => {
    const checked = checkbox.checked
    log(`Updating ${config.inputName} to ${checked}`)
    await storage.set(config.inputName, checked)
  })

  // Create label text without innerHTML
  const labelText = document.createElement("span")
  labelText.appendChild(document.createTextNode(config.label))
  if (config.help) {
    labelText.appendChild(document.createTextNode("\u00A0"))
    const em = document.createElement("em")
    em.textContent = config.help
    labelText.appendChild(em)
  }

  label.appendChild(checkbox)
  label.appendChild(document.createTextNode("\u00A0\u00A0"))
  label.appendChild(labelText)

  flexDiv.appendChild(label)

  const hintDiv = document.createElement("div")
  hintDiv.className = "md:flex md:items-center mb-6"
  hintDiv.textContent = config.hint

  wrapper.appendChild(flexDiv)
  wrapper.appendChild(hintDiv)

  return wrapper
}

function createSectionHeader(title: string): HTMLDivElement {
  const div = document.createElement("div")

  const legend = document.createElement("legend")
  const h2 = document.createElement("h2")
  h2.textContent = title
  legend.appendChild(h2)

  const hr = document.createElement("hr")

  div.appendChild(legend)
  div.appendChild(hr)

  return div
}

export async function renderOptions(containerId: string): Promise<void> {
  const container = document.getElementById(containerId)
  if (!container) return

  const storage = new Storage()

  // Create form
  const form = document.createElement("form")
  form.id = "options-storage"

  // Collapse section
  form.appendChild(createSectionHeader("Collapse Inappropriate Stories"))

  for (const config of checkboxConfigs) {
    form.appendChild(createCheckbox(config, storage))
  }

  // Privacy section
  form.appendChild(createSectionHeader("Privacy Settings"))

  for (const config of privacyConfigs) {
    form.appendChild(createCheckbox(config, storage))
  }

  // Clear container and add form
  while (container.firstChild) {
    container.removeChild(container.firstChild)
  }
  container.appendChild(form)
}
