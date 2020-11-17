/* eslint-disable jsx-a11y/label-has-associated-control */
import { m } from "malevic";
import { Collapse, DefaultCollapse, logger } from "utils";
import OptionsSync from "webext-options-sync";

const MyOptions = new OptionsSync({ defaults: DefaultCollapse as any });

const log = logger("mbfc:options");

const baseClasses = {
  styleClasses: "mb-12",
  labelClasses: "block font-bold mr-2",
};

const inputClasses = {
  fieldClasses:
    "form-input bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500",
  ...baseClasses,
};

const checkboxClasses = {
  fieldClasses: "form-checkbox",
  ...baseClasses,
};

const groups = [
  {
    legend: "Collapse Inappropriate Stories",
    fields: [
      {
        type: "checkbox",
        label: "Left Bias",
        help: "(You should check this)",
        model: "collapse.collapseLeft",
        inputName: "collapse.collapseLeft",
        default: false,
        hint:
          "Left Bias media sources are moderately to strongly biased toward liberal causes through story selection and/or political affiliation.  They may utilize strong loaded words (wording that attempts to influence an audience by using appeal to emotion or stereotypes), publish misleading reports and omit reporting of information that may damage liberal causes. Some sources in this category may be untrustworthy.",
        ...checkboxClasses,
      },
      {
        type: "checkbox",
        label: "Left-Center Bias ",
        model: "collapse.collapseLeftCenter",
        inputName: "collapse.collapseLeftCenter",
        default: false,
        hint:
          "Left-Center media sources have a slight to moderate liberal bias.  They often publish factual information that utilizes loaded words (wording that attempts to influence an audience by using appeal to emotion or stereotypes) to favor liberal causes.  These sources are generally trustworthy for information, but may require further investigation.",
        ...checkboxClasses,
      },
      {
        type: "checkbox",
        label: "Least Biased ",
        model: "collapse.collapseCenter",
        inputName: "collapse.collapseCenter",
        default: false,
        hint:
          "Least Biased/Center media sources have minimal bias and use very few loaded words (wording that attempts to influence an audience by using appeal to emotion or stereotypes).  The reporting is factual and usually sourced.  These are the most credible media sources.",
        ...checkboxClasses,
      },
      {
        type: "checkbox",
        label: "Right-Center Bias ",
        model: "collapse.collapseRightCenter",
        inputName: "collapse.collapseRightCenter",
        default: false,
        hint:
          "Right-Center media sources are slightly to moderately conservative in bias. They often publish factual information that utilizes loaded words (wording that attempts to influence an audience by using appeal to emotion or stereotypes) to favor conservative causes. These sources are generally trustworthy for information, but may require further investigation.",
        ...checkboxClasses,
      },
      {
        type: "checkbox",
        label: "Right Bias",
        help: "(You should check this)",
        model: "collapse.collapseRight",
        inputName: "collapse.collapseRight",
        default: false,
        hint:
          "Right Bias media sources are moderately to strongly biased toward conservative causes through story selection and/or political affiliation. They may utilize strong loaded words (wording that attempts to influence an audience by using appeal to emotion or stereotypes), publish misleading reports and omit reporting of information that may damage conservative causes. Some sources in this category may be untrustworthy.",
        ...checkboxClasses,
      },
      {
        type: "checkbox",
        label: "Pro-Science ",
        model: "collapse.collapseProScience",
        inputName: "collapse.collapseProScience",
        default: false,
        hint:
          "Pro-Science media sources consist of legitimate science or are evidence based through the use of credible scientific sourcing.  Legitimate science follows the scientific method, is unbiased and does not use emotional words.  These sources also respect the consensus of experts in the given scientific field and strive to publish peer reviewed science. Some sources in this category may have a slight political bias, but adhere to scientific principles.",
        ...checkboxClasses,
      },
      {
        type: "checkbox",
        label: "Conspiracy-Pseudoscience",
        help: "(You should check this)",
        model: "collapse.collapseConspiracy",
        inputName: "collapse.collapseConspiracy",
        default: false,
        hint:
          "Sources in the Conspiracy-Pseudoscience category “may” publish unverifiable information that is “not always” supported by evidence. These sources “may” be untrustworthy for credible/verifiable information, therefore fact checking and further investigation is recommended on a per article basis when obtaining information from these sources.",
        ...checkboxClasses,
      },
      {
        type: "checkbox",
        label: "Satire ",
        model: "collapse.collapseSatire",
        inputName: "collapse.collapseSatire",
        default: false,
        hint:
          "Satire media sources exclusively use humor, irony, exaggeration, or ridicule to expose and criticize people’s stupidity or vices, particularly in the context of contemporary politics and other topical issues. Primarily these sources are clear that they are satire and do not attempt to deceive.",
        ...checkboxClasses,
      },
      {
        type: "checkbox",
        label: "Questionable Sources/Fake News",
        help: "(You should check this)",
        model: "collapse.collapseFakeNews",
        inputName: "collapse.collapseFakeNews",
        default: false,
        hint:
          "Questionable Sources/Fake News media source exhibits any of the following: extreme bias, overt propaganda, poor or no sourcing to credible information and/or is fake news. Fake News is the deliberate attempt to publish hoaxes and/or disinformation for the purpose of profit or influence (Learn More). Sources listed in the Questionable Category may be very untrustworthy and should be fact checked on a per article basis.",
        ...checkboxClasses,
      },
      {
        type: "checkbox",
        label: "Mixed Factual Reporting",
        help: "(You should check this)",
        model: "collapse.collapseMixed",
        inputName: "collapse.collapseMixed",
        default: false,
        hint:
          "Mixed Factual Reporting media sources have a track record of publishing false stories, and should be treated used with caution.",
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
        model: "mbfcBlockAnalytics",
        inputName: "mbfcBlockAnalytics",
        default: false,
        hint: (
          <div>
            <label>
              This extension may collect&nbsp;
              <b>anonymous</b>
              &nbsp; usage data to help improve the extension. The events are:
            </label>
            <ul>
              <li class="show-list">
                Domains that are NOT rated by&nbsp;
                <a
                  href="https://mediabiasfactcheck.com"
                  rel="noreferrer"
                  target="_blank"
                >
                  Media Bias Fact Check
                </a>
                . Highly viewed, unranked sites will be recommended for analysis
              </li>
              <li class="show-list">
                Site ratings shown, such as LEFT, LEFT-CENTER, LEAST,
                RIGHT-CENTER, RIGHT
              </li>
              <li class="show-list">
                Getting more details from&nbsp;
                <a
                  href="https://mediabiasfactcheck.com"
                  rel="noreferrer"
                  target="_blank"
                >
                  Media Bias Fact Check
                </a>
                &nbsp;on a site
              </li>
              <li class="show-list">
                Searching a site using&nbsp;
                <a
                  href="https://factualsearch.news"
                  rel="noreferrer"
                  target="_blank"
                >
                  factualsearch.news
                </a>
                &nbsp;on a topic
              </li>
              <li class="show-list">Sites that are ignored</li>
            </ul>
          </div>
        ),
        ...checkboxClasses,
      },
    ],
  },
];

class Options {
  private static instance: Options;

  ready: boolean;
  linked: boolean;
  model: Collapse = DefaultCollapse;

  private constructor() {
    this.ready = false;
    this.linked = false;
  }

  static getInstance() {
    if (!Options.instance) {
      Options.instance = new Options();
      Options.instance.loadOptions().then(() => {
        Options.instance.ready = true;
      });
    }
    return Options.instance;
  }

  async loadOptions(): Promise<any> {
    log(`Requesting options`);
    const options = await MyOptions.getAll();
    log(`Options retrieved in loadOptions: `, options);
    this.model = options;
    return this.model;
  }

  delay(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, 100);
    });
  }

  async mounted() {
    if (this.ready) return;
    await this.delay();
    if (this.ready) return;
    await this.delay();
    if (this.ready) return;
    await this.delay();
    if (this.ready) return;
    await this.delay();
    if (this.ready) return;
    await this.delay();
    if (this.ready) return;
    await this.delay();
  }

  async startForm() {
    if (!this.linked) {
      this.linked = true;
      log(`Linking to form`);
      MyOptions.syncForm("#options-storage");
    }
  }
}

const Checkbox = ({
  heading,
  name,
  description,
  checked,
  styleClasses,
  labelClasses,
  fieldClasses,
  help,
}): Element => {
  log(`Creating ${name}`);
  return (
    <div class={styleClasses}>
      <div className="md:flex md:items-center mb-6">
        <label class={labelClasses} for={name}>
          <input
            checked={checked}
            class={fieldClasses}
            id={name}
            name={name}
            type="checkbox"
          />
          &nbsp;&nbsp;
          <span class="">
            {heading}
            &nbsp;
            {help}
          </span>
        </label>
      </div>
      <div class="md:flex md:items-center mb-6">{description}</div>
    </div>
  );
};

const FormControls = ({ startForm }) => {
  return (
    <div onrender={startForm}>
      {groups.map((g) => {
        const legend = (
          <div>
            <legend>
              <h2>{g.legend}</h2>
            </legend>
            <hr />
          </div>
        );
        const fields = Array.from(g.fields).map((f: any) => (
          <Checkbox
            checked={f.default}
            description={f.hint}
            fieldClasses={f.fieldClasses}
            heading={f.label}
            help={f.help}
            labelClasses={f.labelClasses}
            name={f.inputName}
            styleClasses={f.styleClasses}
          />
        ));
        return [legend, ...fields];
      })}
    </div>
  );
};

export const Config = (): Element => {
  const options = Options.getInstance();

  return (
    <div class="content">
      <form class="" id="options-storage" onrender={() => options.mounted()}>
        {!options.ready ? (
          <div>&nbsp;</div>
        ) : (
          <FormControls startForm={() => options.startForm()} />
        )}
      </form>
    </div>
  );
};
