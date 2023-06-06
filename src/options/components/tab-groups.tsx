import type { ReactElement } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { CollapseKeys } from "~shared/config-handler"

export interface TabFields {
  type: string
  label: string
  help?: string
  value: boolean
  setValue: (n: boolean) => void
  inputName: string
  hint: string | ReactElement
  fieldClasses: string
  styleClasses: string
  labelClasses: string
}

export interface TabGroups {
  legend: string
  fields: TabFields[]
}

export function getTabGroups(): TabGroups[] {
  const [collapseLeft, setCollapseLeft] = useStorage(CollapseKeys.collapseLeft, false)
  const [collapseLeftCenter, setCollapseLeftCenter] = useStorage(CollapseKeys.collapseLeftCenter, false)
  const [collapseCenter, setCollapseCenter] = useStorage(CollapseKeys.collapseCenter, false)
  const [collapseRightCenter, setCollapseRightCenter] = useStorage(CollapseKeys.collapseRightCenter, false)
  const [collapseRight, setCollapseRight] = useStorage(CollapseKeys.collapseRight, false)
  const [collapseProScience, setCollapseProScience] = useStorage(CollapseKeys.collapseProScience, false)
  const [collapseConspiracy, setCollapseConspiracy] = useStorage(CollapseKeys.collapseConspiracy, false)
  const [collapseSatire, setCollapseSatire] = useStorage(CollapseKeys.collapseSatire, false)
  const [collapseFakeNews, setCollapseFakeNews] = useStorage(CollapseKeys.collapseFakeNews, false)
  const [collapseMixed, setCollapseMixed] = useStorage(CollapseKeys.collapseMixed, false)
  const [collapseSponsored, setCollapseSponsored] = useStorage(CollapseKeys.collapseSponsored, false)
  const [mbfcBlockAnalytics, setMbfcBlockAnalytics] = useStorage("mbfcBlockAnalytics", false)

  const baseClasses = {
    styleClasses: "mb-4",
    labelClasses: "block font-bold mr-2",
  }

  const checkboxClasses = {
    fieldClasses: "form-checkbox border bg-red-100 border-red-300 text-red-500 focus:ring-red-200",
    ...baseClasses,
  }

  return [
    {
      legend: "Collapse Inappropriate Stories",
      fields: [
        {
          type: "checkbox",
          label: "Left Bias",
          help: "(You should check this)",
          value: collapseLeft,
          setValue: setCollapseLeft,
          inputName: CollapseKeys.collapseLeft,
          hint: "Left Bias media sources are moderately to strongly biased toward liberal causes through story selection and/or political affiliation.  They may utilize strong loaded words (wording that attempts to influence an audience by using appeal to emotion or stereotypes), publish misleading reports and omit reporting of information that may damage liberal causes. Some sources in this category may be untrustworthy.",
          ...checkboxClasses,
        },
        {
          type: "checkbox",
          label: "Left-Center Bias ",
          value: collapseLeftCenter,
          setValue: setCollapseLeftCenter,
          inputName: CollapseKeys.collapseLeftCenter,
          hint: "Left-Center media sources have a slight to moderate liberal bias.  They often publish factual information that utilizes loaded words (wording that attempts to influence an audience by using appeal to emotion or stereotypes) to favor liberal causes.  These sources are generally trustworthy for information, but may require further investigation.",
          ...checkboxClasses,
        },
        {
          type: "checkbox",
          label: "Least Biased ",
          value: collapseCenter,
          setValue: setCollapseCenter,
          inputName: CollapseKeys.collapseCenter,
          hint: "Least Biased/Center media sources have minimal bias and use very few loaded words (wording that attempts to influence an audience by using appeal to emotion or stereotypes).  The reporting is factual and usually sourced.  These are the most credible media sources.",
          ...checkboxClasses,
        },
        {
          type: "checkbox",
          label: "Right-Center Bias ",
          value: collapseRightCenter,
          setValue: setCollapseRightCenter,
          inputName: CollapseKeys.collapseRightCenter,
          hint: "Right-Center media sources are slightly to moderately conservative in bias. They often publish factual information that utilizes loaded words (wording that attempts to influence an audience by using appeal to emotion or stereotypes) to favor conservative causes. These sources are generally trustworthy for information, but may require further investigation.",
          ...checkboxClasses,
        },
        {
          type: "checkbox",
          label: "Right Bias",
          help: "(You should check this)",
          value: collapseRight,
          setValue: setCollapseRight,
          inputName: CollapseKeys.collapseRight,
          hint: "Right Bias media sources are moderately to strongly biased toward conservative causes through story selection and/or political affiliation. They may utilize strong loaded words (wording that attempts to influence an audience by using appeal to emotion or stereotypes), publish misleading reports and omit reporting of information that may damage conservative causes. Some sources in this category may be untrustworthy.",
          ...checkboxClasses,
        },
        {
          type: "checkbox",
          label: "Pro-Science ",
          value: collapseProScience,
          setValue: setCollapseProScience,
          inputName: CollapseKeys.collapseProScience,
          hint: "Pro-Science media sources consist of legitimate science or are evidence based through the use of credible scientific sourcing.  Legitimate science follows the scientific method, is unbiased and does not use emotional words.  These sources also respect the consensus of experts in the given scientific field and strive to publish peer reviewed science. Some sources in this category may have a slight political bias, but adhere to scientific principles.",
          ...checkboxClasses,
        },
        {
          type: "checkbox",
          label: "Conspiracy-Pseudoscience",
          help: "(You should check this)",
          value: collapseConspiracy,
          setValue: setCollapseConspiracy,
          inputName: CollapseKeys.collapseConspiracy,
          hint: "Sources in the Conspiracy-Pseudoscience category “may” publish unverifiable information that is “not always” supported by evidence. These sources “may” be untrustworthy for credible/verifiable information, therefore fact checking and further investigation is recommended on a per article basis when obtaining information from these sources.",
          ...checkboxClasses,
        },
        {
          type: "checkbox",
          label: "Satire ",
          value: collapseSatire,
          setValue: setCollapseSatire,
          inputName: CollapseKeys.collapseSatire,
          hint: "Satire media sources exclusively use humor, irony, exaggeration, or ridicule to expose and criticize people’s stupidity or vices, particularly in the context of contemporary politics and other topical issues. Primarily these sources are clear that they are satire and do not attempt to deceive.",
          ...checkboxClasses,
        },
        {
          type: "checkbox",
          label: "Questionable Sources/Fake News",
          help: "(You should check this)",
          value: collapseFakeNews,
          setValue: setCollapseFakeNews,
          inputName: CollapseKeys.collapseFakeNews,
          hint: "Questionable Sources/Fake News media source exhibits any of the following: extreme bias, overt propaganda, poor or no sourcing to credible information and/or is fake news. Fake News is the deliberate attempt to publish hoaxes and/or disinformation for the purpose of profit or influence (Learn More). Sources listed in the Questionable Category may be very untrustworthy and should be fact checked on a per article basis.",
          ...checkboxClasses,
        },
        {
          type: "checkbox",
          label: "Mixed Factual Reporting",
          help: "(You should check this)",
          value: collapseMixed,
          setValue: setCollapseMixed,
          inputName: CollapseKeys.collapseMixed,
          hint: "Mixed Factual Reporting media sources have a track record of publishing false stories, and should be treated used with caution.",
          ...checkboxClasses,
        },
        {
          type: "checkbox",
          label: "Sponsored ads",
          help: "(Check this if you hate Facebook marketing to you)",
          value: collapseSponsored,
          setValue: setCollapseSponsored,
          inputName: CollapseKeys.collapseSponsored,
          hint: "Sponsored ads typically annoy users. This option will collapse the ads.",
          ...checkboxClasses,
        },
      ],
    },
    {
      legend: "Privacy Settings",
      fields: [
        {
          type: "checkbox",
          label: "Disable anonymous usage reporting",
          value: mbfcBlockAnalytics,
          setValue: setMbfcBlockAnalytics,
          inputName: "mbfcBlockAnalytics",
          hint: (
            <div>
              <label>
                This extension may collect&nbsp;
                <b>anonymous</b>
                &nbsp; usage data to help improve the extension. The events are:
              </label>
              <ul>
                <li className="show-list">
                  Domains that are NOT rated by&nbsp;
                  <a href="https://mediabiasfactcheck.com" rel="noreferrer" target="_blank">
                    Media Bias Fact Check
                  </a>
                  . Highly viewed, unranked sites will be recommended for analysis
                </li>
                <li className="show-list">Site ratings shown, such as LEFT, LEFT-CENTER, LEAST, RIGHT-CENTER, RIGHT</li>
                <li className="show-list">
                  Getting more details from&nbsp;
                  <a href="https://mediabiasfactcheck.com" rel="noreferrer" target="_blank">
                    Media Bias Fact Check
                  </a>
                  &nbsp;on a site
                </li>
                <li className="show-list">
                  Searching a site using&nbsp;
                  <a href="https://factualsearch.news" rel="noreferrer" target="_blank">
                    factualsearch.news
                  </a>
                  &nbsp;on a topic
                </li>
                <li className="show-list">Sites that are ignored</li>
              </ul>
            </div>
          ),
          ...checkboxClasses,
        },
      ],
    },
  ]
}
