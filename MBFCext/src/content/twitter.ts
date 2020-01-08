import { Filter } from "./filter";
import { get } from "lodash";

import debug from "debug";
import { isDevMode, toM } from "../utils/utils";
import { ISource } from "../utils/definitions";
import { getDomain } from "../utils/getDomain";
import { checkDomain } from "../utils/checkDomain";

import { icon } from "@fortawesome/fontawesome-svg-core";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons/faExternalLinkAlt";
import { faCog } from "@fortawesome/free-solid-svg-icons/faCog";
import { faEye } from "@fortawesome/free-regular-svg-icons/faEye";

isDevMode();
const log = debug("mbfc:twitter");

const MARKER = "mbfcfound";
const NOT = `:not(.${MARKER})`;
const DATA_NODE_SEARCH = `article${NOT}`;
const TWITTER_HANDLE_SEARCH = `${DATA_NODE_SEARCH} a[aria-haspopup="false"]`;
const RETWEET_SEARCH = `${DATA_NODE_SEARCH} a[target='_blank'] svg`;

export class Twitter extends Filter {
    count = 0;
    observer = null;

    constructor() {
        super();

        log(`Class Twitter started`);
    }

    getHiddenDiv(site, count) {
        var hDiv = document.createElement("div");
        hDiv.className = "mbfcext " + MARKER;
        hDiv.id = "mbfcext-hide-" + count;

        var span_id = "mbfcspan" + count;
        var icon_id = "mbfcicon" + count;
        var hide_class = "mbfcelh" + count;
        var hide = [
            '<div class="mbfc-hide-ctrl' +
                count +
                '" style="cursor: pointer"' +
                'onclick="var count = ' +
                count +
                ";" +
                "Array.prototype.filter.call(document.getElementsByClassName('mbfcelh'+count),function(e){if(e&&e.style){var t=document.getElementById('mbfcspan'+count),s=document.getElementById('mbfcicon'+count);'none'==e.style.display?(e.style.display='block',s.classList.remove('fa-eye'),s.classList.add('fa-eye-slash'),t.textContent=' Hide'):(e.style.display='none',s.classList.remove('fa-eye-slash'),s.classList.add('fa-eye'),t.textContent=' Show')}});" +
                '">' +
                icon(faEye, {
                    attributes: {
                        id: icon_id,
                        "aria-hidden": "true",
                    },
                }).html +
                '<span id="' +
                span_id +
                '"> Show</span>',
            "</div>",
        ];
        hDiv.innerHTML = hide.join("");
        return hDiv;
    }

    getReportDiv(site, count, tagsearch, collapse) {
        var iDiv = document.createElement("div");
        iDiv.className = "mbfcext " + MARKER + " mbfc-twitter-holder";
        iDiv.id = "mbfcext" + count;

        var mtype = site.b.toLowerCase().replace(" ", "-");
        var master_style = "mbfc-" + mtype;

        var external_link = `&nbsp;` + icon(faExternalLinkAlt).html;

        const hide = this.config.hiddenSites[site.d] || collapse;
        var prompt = hide ? "show" : "hide";

        var toolbar = `
<tr id="mbfctt${count}" class="mbfc-td-text" style="display:none">
    <td colspan="5">
        <button id="toolbar-button1-${count}" class="mbfc-button-success mbfc-right-spacer toolbar-button1-${count}" data-domain="${site.d}" data-collapse="${prompt}">Always ${prompt} ${site.n}</button><span class="spacer">&nbsp;</span>
        <button class="mbfc-button-warning toolbar-button3-${count}">Reset Hidden Sites</button>
        <button style="float: right;" class="mbfc-button-secondary toolbar-button2-${count}">Say Thanks</button>
    </td>
</tr>`;

        var bias_link = `<a target="_blank" href="${site.u}"><span class="mbfc-td-text">${this.config.biases[site.b].name.replace(/ Bias(ed)?/, "")}${external_link}</span></a>`;
        const cog = icon(faCog, {
            attributes: {
                "aria-hidden": "true",
            },
        }).html;
        // var drop_down = `<a class="mbfc-drop-down" onclick="el=document.getElementById('mbfctt${count}'); if (el.style.display=='none') { el.style.display='table-row'; } else { el.style.display='none'; }; console.log('cog'); return false;">${cog}</a>`;
        var drop_down = '';

        var details = [];
        if (site.r > "") {
            details.push(`<a title="Open MediaBiasFactCheck.com for ${site.n}" target="_blank" href="${site.u}">Factually: ${site.r}${external_link}</a>`);
        }
        details.push(
            `<a title="This takes you to moz.com to define 'Link Equity' that we use to rank sites" href="https://moz.com/learn/seo/what-is-link-equity">References</a>: ${toM(
                site.L,
            )}`,
        );
        details.push(`<span title="Within MBFC sites, this site has ${site.P}% higher number of external equity links than other sites">Popularity: ${site.P}%</span>`);
        if (tagsearch && site.b !== "satire") {
            details.push(
                `<a title="Search factualsearch.news for '${tagsearch}'" target="_blank" href="https://factualsearch.news/#gsc.tab=0&fns.type=mostly-center&gsc.q=${encodeURIComponent(
                    tagsearch,
                )}">Search ${external_link}</a> `,
            );
        } else {
            details.push(`<a title="Open MediaBiasFactCheck.com for ${site.n}" target="_blank" href="${site.u}">MBFC Details${external_link}</a>`);
        }

        var table, tr;

        switch (site.b) {
            case "satire":
            case "conspiracy":
            case "pro-science":
                tr = ` <td colspan="5" class="mbfc-td mbfc-td-${site.b}">${bias_link}</td> `;
                break;
            default:
                var tdl = site.b === "left" ? bias_link : "&nbsp;",
                    tdlc = site.b === "left-center" ? bias_link : "&nbsp;",
                    tdc = site.b === "center" ? bias_link : "&nbsp;",
                    tdrc = site.b === "right-center" ? bias_link : "&nbsp;",
                    tdr = site.b === "right" ? bias_link : "&nbsp;";

                tr = `
    <td class="mbfc-td mbfc-td-left">${tdl}</td>
    <td class="mbfc-td mbfc-td-left-center">${tdlc}</td>
    <td class="mbfc-td mbfc-td-center">${tdc}</td>
    <td class="mbfc-td mbfc-td-right-center">${tdrc}</td>
    <td class="mbfc-td mbfc-td-right">${tdr}</td>
`;
                break;
        }

        table = `
<div class="">
    <table class="mbfc-table-table" cellpadding="0" border="0">
        <tbody>
            <tr>
                ${tr}
            </tr>
            <tr>
                <td class="mbfc-td" colspan="5">${drop_down}<span class="mbfc-td-text">${details.join(", &nbsp;")}</span></td>
            </tr>
            ${toolbar}
        </tbody>
    </table>
</div>
`;

        iDiv.innerHTML = table;
        return iDiv;
    }

    inject(parent, site, user_content, collapseDivs, tagsearch, collapse) {
        if (!collapseDivs) {
            var iDiv = this.getReportDiv(site, this.count, tagsearch, collapse);
            parent.appendChild(iDiv);
            this.addButtons(site.n, this.count);
        } else {
            user_content.forEach(el => {
                this.hideElement(el, this.count);
            });
            this.hideElement(collapseDivs, this.count);
            var iDiv = this.getReportDiv(site, this.count, tagsearch, collapse);
            var hDiv = this.getHiddenDiv(site, this.count);
            parent.appendChild(hDiv);
            parent.appendChild(iDiv);
            this.addButtons(site.n, this.count);
        }
        this.count++;
    }

    process() {
        if (!this.loaded) {
            return;
        }
        var nodes = document.querySelectorAll(DATA_NODE_SEARCH);
        nodes.forEach(top_node => {
            let domain, href, path, final_domain, alias, baseUrl, hidden, unknown, collapse, site;

            const checkText = (text, offset) => {
                if (typeof text !== "string") return null;
                text = text
                    .replace("http:", "https:")
                    .replace("www.", "")
                    .toLowerCase();
                if (text.startsWith("@")) {
                    domain = this.config.tw_pages[`https://twitter.com/${text.substr(1, 255)}`];
                }
                if (!domain && text.startsWith("https://twitter.com")) {
                    domain = this.config.tw_pages[text];
                }
                //  else if (text.indexOf(".com") > -1) debugger;
                if (text.split(".").length === 0) return;
                if (!domain && text.startsWith("https://")) {
                    ({ domain, path } = getDomain(text));
                }
                const check = checkDomain(domain, "/", this.config);
                log(`Checking text ${text} (domain=${domain}) #${offset}`, check);
                ({ final_domain, alias, baseUrl, hidden, unknown, collapse, site } = check);
            };

            // if (!site) {
            //     const elems = top_node.querySelectorAll(RETWEET_SOURCE_SEARCH);
            //     log(elems);
            //     for (let elem of elems) {
            //         site = checkText(elem.textContent, 1);
            //         if (site) break;
            //     }
            // }

            if (!site) {
                const svgs = top_node.querySelectorAll(RETWEET_SEARCH);
                log(svgs);
                for (let link of svgs) {
                    try {
                        checkText('https://' + link.parentElement.parentElement.children[1].textContent, 2);
                        if (site) break;
                    } catch (err) {}
                }
            }

            if (!site) {
                let link = top_node.querySelector(TWITTER_HANDLE_SEARCH);
                if (link) {
                    checkText(get(link, "href").toLowerCase(), 3);
                }
            }

            if (!site) {
                log(`No site`);
                return;
            }
            const existing = top_node.querySelector(`.${MARKER}.mbfc-twitter-holder`);
            if (existing) {
                log(`Already processed ${site.n}`);
                return;
            }
            top_node.classList.add(MARKER);
            var user_content = top_node.querySelectorAll("div:nth-child(1) > div > div + div");
            var collapseDivs = collapse ? top_node.parentNode.querySelector(".commentable_item") : null;
            var tagsearch = top_node.querySelectorAll(".mbs > a");
            if (tagsearch && tagsearch.length > 0) {
                tagsearch = tagsearch[0]["text"];
            } else {
                tagsearch = null;
            }
            this.reportSite(site, false, false, collapse);
            this.inject(top_node, site, user_content, collapseDivs, tagsearch, collapse);
        });
    }
}
