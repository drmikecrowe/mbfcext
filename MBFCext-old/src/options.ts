
import debug from "debug";
import { isDevMode } from "./utils";
import { ReleaseNotes } from "./ReleaseNotes";
isDevMode();
const log = debug("mbfc:options");

const setup = () => {
    const chromeOptions = (chrome as any).options;
    if (!chromeOptions) return true;
    if (chromeOptions.opts.title === 'Section') return false;

    log(`Configuring options`);

    chromeOptions.opts.autoSave = false;

    chromeOptions.opts.title = "Section";

    chromeOptions.opts.about = '<p>This extension is open-source, and is based here: <a href="https://github.com/drmikecrowe/mbfcext">Github Project Page</a></p>';

    chromeOptions.addTab("Introduction", [
        {
            type: "html",
            html: ReleaseNotes,
        },
    ]);

    chromeOptions.addTab("Collapse", "Collapse Inappropriate Stories", [
        { type: "h3", desc: "Left Bias (We recommend collapsing)" },
        {
            name: "collapse-left",
            type: "checkbox",
            default: false,
            desc:
                "Left Bias media sources are moderately to strongly biased toward liberal causes through story selection and&#x2F;or political affiliation.  They may utilize strong loaded words (wording that attempts to influence an audience by using appeal to emotion or stereotypes), publish misleading reports and omit reporting of information that may damage liberal causes. Some sources in this category may be untrustworthy.",
        },
        { type: "h3", desc: "Left-Center Bias " },
        {
            name: "collapse-leftcenter",
            type: "checkbox",
            default: false,
            desc:
                "Left-Center media sources have a slight to moderate liberal bias.  They often publish factual information that utilizes loaded words (wording that attempts to influence an audience by using appeal to emotion or stereotypes) to favor liberal causes.  These sources are generally trustworthy for information, but may require further investigation.  ",
        },
        { type: "h3", desc: "Least Biased " },
        {
            name: "collapse-center",
            type: "checkbox",
            default: false,
            desc:
                "Least Biased/Center media sources have minimal bias and use very few loaded words (wording that attempts to influence an audience by using appeal to emotion or stereotypes).  The reporting is factual and usually sourced.  These are the most credible media sources.  ",
        },
        { type: "h3", desc: "Right-Center Bias " },
        {
            name: "collapse-right-center",
            type: "checkbox",
            default: false,
            desc:
                "Right-Center media sources are slightly to moderately conservative in bias. They often publish factual information that utilizes loaded words (wording that attempts to influence an audience by using appeal to emotion or stereotypes) to favor conservative causes. These sources are generally trustworthy for information, but may require further investigation.  ",
        },
        { type: "h3", desc: "Right Bias (We recommend collapsing)" },
        {
            name: "collapse-right",
            type: "checkbox",
            default: false,
            desc:
                "Right Bias media sources are moderately to strongly biased toward conservative causes through story selection and&#x2F;or political affiliation. They may utilize strong loaded words (wording that attempts to influence an audience by using appeal to emotion or stereotypes), publish misleading reports and omit reporting of information that may damage conservative causes. Some sources in this category may be untrustworthy.",
        },
        { type: "h3", desc: "Pro-Science " },
        {
            name: "collapse-pro-science",
            type: "checkbox",
            default: false,
            desc:
                "Pro-Science media sources consist of legitimate science or are evidence based through the use of credible scientific sourcing.  Legitimate science follows the scientific method, is unbiased and does not use emotional words.  These sources also respect the consensus of experts in the given scientific field and strive to publish peer reviewed science. Some sources in this category may have a slight political bias, but adhere to scientific principles.",
        },
        { type: "h3", desc: "Conspiracy-Pseudoscience (We recommend collapsing)" },
        {
            name: "collapse-conspiracy",
            type: "checkbox",
            default: false,
            desc:
                "Sources in the Conspiracy-Pseudoscience category “may” publish unverifiable information that is “not always” supported by evidence. These sources “may” be untrustworthy for credible&#x2F;verifiable information, therefore fact checking and further investigation is recommended on a per article basis when obtaining information from these sources. ",
        },
        { type: "h3", desc: "Satire " },
        {
            name: "collapse-satire",
            type: "checkbox",
            default: false,
            desc:
                "Satire media sources exclusively use humor, irony, exaggeration, or ridicule to expose and criticize people’s stupidity or vices, particularly in the context of contemporary politics and other topical issues. Primarily these sources are clear that they are satire and do not attempt to deceive.",
        },
        { type: "h3", desc: "Questionable Sources/Fake News (We recommend collapsing)" },
        {
            name: "collapse-fake-news",
            type: "checkbox",
            default: false,
            desc:
                "Questionable Sources/Fake News media source exhibits any of the following: extreme bias, overt propaganda, poor or no sourcing to credible information and&#x2F;or is fake news. Fake News is the deliberate attempt to publish hoaxes and&#x2F;or disinformation for the purpose of profit or influence (Learn More). Sources listed in the Questionable Category may be very untrustworthy and should be fact checked on a per article basis. ",
        },
        { type: "h3", desc: "Mixed Factual Reporting (We recommend collapsing)" },
        {
            name: "collapse-mixed",
            type: "checkbox",
            default: false,
            desc: "Mixed Factual Reporting media sources have a track record of publishing false stories, and should be treated used with caution.",
        },
    ]);

    chromeOptions.addTab("Privacy Settings", [
        {
            type: "html",
            html:
                '<label> This extension may collect <b>anonymous</b> usage data to help improve the results provided. The events are: </label><ul><li>Domains that are NOT rated by <a href="https://mediabiasfactcheck.com" target="_blank">Media Bias Fact Check</a>. Highly viewed, unranked sites will be recommended for analysis</li><li>Site ratings shown, such as LEFT, LEFT-CENTER, LEAST, RIGHT-CENTER, RIGHT</li><li>Getting more details from <a href="https://mediabiasfactcheck.com" target="_blank">Media Bias Fact Check</a> on a site</li><li>Sites that are ignored</li></ul>',
        },
        {
            name: "mbfcanalytics_disabled",
            default: false,
            desc: "Disable anonymous usage reporting",
        },
    ]);

    chromeOptions.addTab("Ignored Sites", [
        { type: "h3", desc: "Want to clear your ignore list?" },
        {
            name: "reset_ignored",
            default: false,
            desc: "Reset ignored sites",
        },
    ]);

    chromeOptions.addTab("Donate", [
        {
            type: "html",
            html:
                "<p>We would greatly appreciate any donations you are willing to give (especially recurring ones!). &nbsp;Maintaining this extension and adding new features takes a fair amount of time, and donations help encourage more benefits and features.</p>" +
                "<p>You can donate in multiple ways:</p>" +
                "<ul>" +
                '<li>Via <a href="https://paypal.me/drmikecrowe" target="_blank">PayPal</a></li>' +
                '<li>Via <a href="https://www.patreon.com/solvedbymike" target="_blank">Patreon</a></li>' +
                "</ul>  ",
        },
    ]);
};

if (setup()) {
    setTimeout(setup, 1000);
}