<template>
    <form id="optionsStorage" class="w-full">
        <vue-form-generator
            :schema="schema"
            :model="model"
            :options="formOptions"
        >
        </vue-form-generator>
    </form>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import OptionsSync from "webext-options-sync";
import { DefaultCollapse, Collapse, logger } from "utils";
import VueFormGenerator from "vue-form-generator/dist/vfg-core.js";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

Vue.use(VueFormGenerator);
Vue.component("FontAwesomeIcon", FontAwesomeIcon);

const MyOptions = new OptionsSync({ defaults: DefaultCollapse as any });

const log = logger("mbfc:vue:options");

const baseClasses = {
    styleClasses: "flex items-center mb-6",
    labelClasses: "block w-1/3 font-bold text-right mb-1 mb-0 pr-4",
};

const inputClasses = {
    fieldClasses:
        "form-input bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500",
    ...baseClasses,
};

const checkboxClasses = {
    fieldClasses: "form-checkbox h-6 w-6",
    ...baseClasses,
};

@Component
export default class Options extends Vue {
    model: Collapse = DefaultCollapse;

    async loadOptions(): Promise<any> {
        const options = await MyOptions.getAll();
        log(`Options retrieved in loadOptions: `, options);
        this.model = options;
        return this.model;
    }

    mounted() {
        log(`Linking to form`);
        MyOptions.syncForm("#optionsStorage");
    }

    data() {
        this.loadOptions().then((m) => log(`Model now: `, m));
        return {
            model: this.model,
            schema: {
                groups: [
                    {
                        legend: "Section Collapse",
                        fields: [
                            {
                                type: "checkbox",
                                label: "Left Bias",
                                help: "(You should check this)",
                                model: "collapse.collapseLeft",
                                inputName: "collapse.collapseLeft",
                                default: false,
                                featured: true,
                                hint:
                                    "Left Bias media sources are moderately to strongly biased toward liberal causes through story selection and&#x2F;or political affiliation.  They may utilize strong loaded words (wording that attempts to influence an audience by using appeal to emotion or stereotypes), publish misleading reports and omit reporting of information that may damage liberal causes. Some sources in this category may be untrustworthy.",
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
                                featured: true,
                                hint:
                                    "Right Bias media sources are moderately to strongly biased toward conservative causes through story selection and&#x2F;or political affiliation. They may utilize strong loaded words (wording that attempts to influence an audience by using appeal to emotion or stereotypes), publish misleading reports and omit reporting of information that may damage conservative causes. Some sources in this category may be untrustworthy.",
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
                                featured: true,
                                hint:
                                    "Sources in the Conspiracy-Pseudoscience category “may” publish unverifiable information that is “not always” supported by evidence. These sources “may” be untrustworthy for credible&#x2F;verifiable information, therefore fact checking and further investigation is recommended on a per article basis when obtaining information from these sources.",
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
                                featured: true,
                                hint:
                                    "Questionable Sources/Fake News media source exhibits any of the following: extreme bias, overt propaganda, poor or no sourcing to credible information and&#x2F;or is fake news. Fake News is the deliberate attempt to publish hoaxes and&#x2F;or disinformation for the purpose of profit or influence (Learn More). Sources listed in the Questionable Category may be very untrustworthy and should be fact checked on a per article basis.",
                                ...checkboxClasses,
                            },
                            {
                                type: "checkbox",
                                label: "Mixed Factual Reporting",
                                help: "(You should check this)",
                                model: "collapse.collapseMixed",
                                inputName: "collapse.collapseMixed",
                                default: false,
                                featured: true,
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
                                featured: false,
                                hint: `<label> This extension may collect <b>anonymous</b> usage data to help improve the extension. The events are: </label>
                                    <ul>
                                    <li class="show-list">Domains that are NOT rated by <a href="https://mediabiasfactcheck.com" target="_blank">Media Bias Fact Check</a>. Highly viewed, unranked sites will be recommended for analysis</li>
                                    <li class="show-list">Site ratings shown, such as LEFT, LEFT-CENTER, LEAST, RIGHT-CENTER, RIGHT</li>
                                    <li class="show-list">Getting more details from <a href="https://mediabiasfactcheck.com" target="_blank">Media Bias Fact Check</a> on a site</li>
                                    <li class="show-list">Searching a site using <a href="https://factualsearch.news" target="_blank">factualsearch.news</a> on a topic</li>
                                    <li class="show-list">Sites that are ignored</li>
                                    </ul>`,
                                ...checkboxClasses,
                            },
                        ],
                    },
                ],
            },

            formOptions: {
                validateAfterLoad: true,
                validateAfterChanged: true,
                validateAsync: true,
            },
        };
    }
}
</script>

<style lang="scss">
@import "../../../assets/colors.scss";

// from: https://jsfiddle.net/zoul0813/wmdjgz6t/
.vue-form-generator {
    legend {
        font-weight: bold;
        font-size: 1rem;
    }
    .form-group {
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        margin-bottom: 1.6rem;
        padding: 5px 10px;
        label {
            padding: 5px 0;
            margin-right: 1rem;
        }
        &.featured label {
            font-weight: bold;
        }
        &.required label::after {
            content: "*";
            font-weight: normal;
            color: red;
            position: absolute;
            padding-left: 0.2em;
            font-size: 1em;
        }
        &.disabled label {
            color: $c-light;
        }
    }
    .field-wrap {
        display: flex;
        flex: 0 1 400px;
        .wrapper {
            width: 100%;
        }
        .form-control {
            display: block;
            width: 100%;
            outline: 0;
            padding: 5px;
            font-style: italic;
            // color: $white;
        }
    }
    .hint {
        flex: 1 1 100%;
        text-align: justify;
        font-style: italic;
    }
}
.form-checkbox {
    border-color: darkgray;
}
.show-list {
    list-style-type: disc !important;
    margin-left: 30px;
}
</style>
