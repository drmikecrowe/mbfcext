import { Filter } from "./filter";
import { get } from "lodash";

import { icon } from "@fortawesome/fontawesome-svg-core";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons/faExternalLinkAlt";
import { faCog } from "@fortawesome/free-solid-svg-icons/faCog";
import { faEye } from "@fortawesome/free-regular-svg-icons/faEye";
import { err, ok, Result } from "neverthrow";
import {
    isDevMode,
    ISource,
    AssociateSiteMessage,
    getDomain,
    logger,
    ICheckDomain,
    biasNameToShort,
    getSiteFromUrl,
} from "utils";

isDevMode();
const log = logger("mbfc:facebook");

const MARKER = "mbfcfound";
const REPORT_DIV = "mbfcreportdiv";
const NOT = ":not(." + MARKER + ")";
const DATA_NODE_SEARCH = `div[data-pagelet^="FeedUnit"]${NOT}`;
const DIV4 = "div > div + div + div + div";
const DOMAIN_SPANS = "a[rel='nofollow noopener'] span";

interface Story {
    parent: Element;
    top: Element;
    story: Element;
    source: Element;
    comments: Element;
    count: number;
    injected?: Element | null;
    tagsearch?: string;
}

export class Facebook extends Filter {
    private static instance: Facebook;
    count = 0;
    observer = null;

    constructor() {
        super();

        log(`Class Facebook started`);
    }

    static getInstance(): Facebook {
        if (!Facebook.instance) {
            Facebook.instance = new Facebook();
        }
        return Facebook.instance;
    }

    getHiddenDiv(site, count) {
        const hDiv = document.createElement("div");
        hDiv.className = `mbfcext ${MARKER}`;
        hDiv.id = `mbfcext-hide-${count}`;

        const span_id = "mbfcspan" + count;
        const icon_id = `mbfcicon${count}`;
        const hide_class = `mbfc-hide-ctrl${count}`;
        const iconHtml = icon(faEye, {
            attributes: {
                id: icon_id,
                "aria-hidden": "true",
            },
        }).html;
        const inlineCode = `var count=${count};Array.prototype.filter.call(document.getElementsByClassName('mbfcelh'+count),function(e){if(e&&e.style){var t=document.getElementById('mbfcspan'+count),s=document.getElementById('mbfcicon'+count);'none'==e.style.display?(e.style.display='block',s.classList.remove('fa-eye'),s.classList.add('fa-eye-slash'),t.textContent=' Hide'):(e.style.display='none',s.classList.remove('fa-eye-slash'),s.classList.add('fa-eye'),t.textContent=' Show')}});"`;
        const hide = `<div
                class="${hide_class}"
                style="cursor: pointer"
                onclick="${inlineCode}">
                ${iconHtml}
                <span id="${span_id}"> Show</span>
            </div>`;
        hDiv.innerHTML = hide;
        return hDiv;
    }

    getReportDiv(site, count, tagsearch, collapse): Result<Element, null> {
        if (this.config.isErr() || this.sources.isErr()) return err(null);
        const config = this.config.value;
        const biases = this.sources.value.biases;

        const iDiv = document.createElement("div");
        iDiv.className = `mbfcext ${MARKER} ${REPORT_DIV}`;
        iDiv.id = `mbfcext${count}`;

        const mtype = biasNameToShort[site.b];

        const external_link = `&nbsp;${icon(faExternalLinkAlt).html}`;

        const hide = get(config, site.d) || collapse;
        const prompt = hide ? "show" : "hide";

        const toolbar = `
<tr id="mbfctt${count}" class="mbfc-td-text" style="display:none">
    <td colspan="5">
        <button id="toolbar-button1-${count}" class="mbfc-button-success mbfc-right-spacer toolbar-button1-${count}" data-domain="${site.d}" data-collapse="${prompt}">Always ${prompt} ${site.n}</button><span class="spacer">&nbsp;</span>
        <button class="mbfc-button-warning toolbar-button3-${count}">Reset Hidden Sites</button>
        <button style="float: right;" class="mbfc-button-secondary toolbar-button2-${count}">Say Thanks</button>
    </td>
</tr>`;

        const bias_display = biases[mtype].name.replace(/ Bias(ed)?/, "");
        const bias_link = `<a target="_blank" href="${site.u}">
            <span class="mbfc-td-text">${bias_display}${external_link}</span>
        </a>`;
        const cog = icon(faCog, {
            attributes: {
                "aria-hidden": "true",
            },
        }).html;
        const inline_code = `el=document.getElementById('mbfctt${count}'); if (el.style.display=='none') { el.style.display='table-row'; } else { el.style.display='none'; }`;
        const drop_down = `<div
            class="mbfc-drop-down"
            onclick="${inline_code}">${cog}</div>`;

        const details: string[] = [];
        if (site.r > "") {
            details.push(
                `<a title="Open MediaBiasFactCheck.com for ${site.n}" target="_blank" href="${site.u}">Factually: ${site.r}${external_link}</a>`
            );
        }
        details.push(
            `<span title="Within MBFC sites, this site has ${site.P}% higher number of external equity links than other sites">Popularity: ${site.P}%</span>`
        );
        if (tagsearch && mtype !== "satire") {
            details.push(
                `<a title="Search factualsearch.news for '${tagsearch}'" target="_blank" href="https://factualsearch.news/#gsc.tab=0&fns.type=mostly-center&gsc.q=${encodeURIComponent(
                    tagsearch
                )}">Search ${external_link}</a> `
            );
        } else {
            details.push(
                `<a title="Open MediaBiasFactCheck.com for ${site.n}" target="_blank" href="${site.u}">MBFC Details${external_link}</a>`
            );
        }

        const buildNormalRow = () => {
            const tdl = mtype === "left" ? bias_link : "&nbsp;";
            const tdlc = mtype === "left-center" ? bias_link : "&nbsp;";
            const tdc = mtype === "center" ? bias_link : "&nbsp;";
            const tdrc = mtype === "right-center" ? bias_link : "&nbsp;";
            const tdr = mtype === "right" ? bias_link : "&nbsp;";

            return `
                <td class="mbfc-td mbfc-td-left">${tdl}</td>
                <td class="mbfc-td mbfc-td-left-center">${tdlc}</td>
                <td class="mbfc-td mbfc-td-center">${tdc}</td>
                <td class="mbfc-td mbfc-td-right-center">${tdrc}</td>
                <td class="mbfc-td mbfc-td-right">${tdr}</td>
            `;
        };

        const buildOtherRow = () => {
            return ` <td colspan="5" class="mbfc-td mbfc-td-${
                biasNameToShort[site.b]
            }">${bias_link}</td> `;
        };

        let tr;

        switch (biasNameToShort[site.b]) {
            case "satire":
            case "conspiracy":
            case "pro-science":
                tr = buildOtherRow();
                break;
            default:
                tr = buildNormalRow();
                break;
        }

        const details_contents = details.join(", &nbsp;");
        const table = `
<div class="">
    <table class="mbfc-table-table" cellpadding="0" border="0">
        <tbody>
            <tr>
                ${tr}
            </tr>
            <tr>
                <td class="mbfc-td" colspan="5">${drop_down}<span class="mbfc-td-text">${details_contents}</span></td>
            </tr>
            ${toolbar}
        </tbody>
    </table>
</div>
`;

        iDiv.innerHTML = table;
        return ok(iDiv);
    }

    reportAssociated(source: ISource, fb_domain: string) {
        new AssociateSiteMessage(source, fb_domain).sendMessage();
    }

    research(story: Story): Result<ICheckDomain, null> {
        if (!this.loaded || !this.config.isOk() || !this.sources.isOk()) {
            return err(null);
        }
        const sources = this.sources.value;
        const links = story.top.querySelectorAll("a");
        try {
            for (let i = 0; i < Math.min(5, links.length); i++) {
                try {
                    const link = links[i];
                    const href = get(link, "href");
                    const { domain, path } = getDomain(href);
                    if (path === "/") {
                        continue;
                    }
                    if (domain.toLowerCase().indexOf("facebook") > -1) {
                        if (sources.fb_pages[path]) {
                            const fb_domain = sources.fb_pages[url];
                            const url = `https://${fb_domain}${path}`.toLowerCase();
                            log(`Trying to find ${url}`);
                            const res = getSiteFromUrl(`https://${fb_domain}`);
                            if (res.isOk()) {
                                log(
                                    `Found ${res.value.final_domain} from ${url}`
                                );
                                return res;
                            } else {
                                log(link);
                            }
                        }
                    }
                } catch (err) {
                    // ignore
                }
            }
        } catch (err) {
            // ignore
        }
        return err(null);
    }

    getStoryNodes(): Result<Story[], null> {
        if (!this.loaded || !this.config.isOk() || !this.sources.isOk()) {
            return err(null);
        }
        try {
            const findFeeds = (): Element[] => {
                const results = Array.from(
                    document.querySelectorAll(DATA_NODE_SEARCH) || []
                );
                results.forEach((top_node) => top_node.classList.add(MARKER));
                return results;
            };

            const findDiv4 = (nodes: Element[]): Element[] => {
                const results: Element[] = [];
                nodes.forEach((tt) => {
                    const els = Array.from(tt.querySelectorAll(DIV4) || []);
                    results.push(...els);
                });
                return results;
            };

            const findStories = (nodes: Element[]): Story[] => {
                const results: Story[] = [];
                nodes.forEach((cn) => {
                    if (!cn.parentNode) return;
                    const d = cn.parentNode;
                    const dlt = d.children.length === 4;
                    const dsin2 = d?.children[2].querySelector(DOMAIN_SPANS);
                    const dsnin3 = !d?.children[3].querySelector(DOMAIN_SPANS);
                    if (d.parentElement && dlt && dsin2 && dsnin3) {
                        d.classList.add(MARKER);
                        const story: Story = {
                            parent: d as Element,
                            top: d.children[0],
                            story: d.children[1],
                            source: d.children[2],
                            comments: d.children[3],
                            count: -1,
                        };
                        story.injected = story.top.querySelector(
                            `.${REPORT_DIV}`
                        );
                        if (story.injected) {
                            // mbfcext
                            story.count = parseInt(
                                story.injected.id.slice(8, 20)
                            );
                        }
                        results.push(story);
                    } else {
                        // TODO: REMOVE
                        d.classList.add(
                            `ignored-dlt${dlt}-dsin2${dsin2}-dsnin3${dsnin3}`
                        );
                    }
                });
                return results;
            };
            return ok(findStories(findDiv4(findFeeds())));
        } catch (err) {
            // ignore
        }
        return err(null);
    }

    inject(story: Story, res: ICheckDomain) {
        const { site, collapse } = res;
        if (!site) {
            log("ERROR: site empty", res);
            return;
        }
        if (!story.injected) {
            const iDiv = this.getReportDiv(
                site,
                this.count,
                story.tagsearch,
                collapse
            );
            if (iDiv.isErr()) {
                log("ERROR: iDiv empty");
                return;
            }
            story.parent.insertBefore(iDiv.value, story.comments);
            story.injected = iDiv.value;
            story.count = this.count;
            this.addButtons(site.n, this.count);
            const hDiv = this.getHiddenDiv(site, this.count);
            story.comments.appendChild(hDiv);
            this.count++;
        }
        if (collapse) {
            this.hideElement(story.story, story.count);
            this.hideElement(story.source, story.count);
            this.hideElement(story.comments, story.count);
        }
    }

    process() {
        const stories = this.getStoryNodes();
        if (stories.isErr()) return;
        stories.value.forEach((story) => {
            let text;
            const spans: Element[] = Array.from(
                story.source.querySelectorAll(DOMAIN_SPANS)
            ).filter((h) => !h.children.length && h.classList.length > 0);
            while (spans.length) {
                const els = spans.shift();
                if (els && els.textContent) {
                    text = els.textContent.toLowerCase();
                }
                let res = getSiteFromUrl(text);
                if (res.isErr()) continue;
                if (!res.value.final_domain || !res.value.site) {
                    res = this.research(story);
                    if (res.isErr()) continue;
                }
                if (!res.value.final_domain || !res.value.site) {
                    log(`No domain from ${text}`, res.value);
                    continue;
                }
                this.inject(story, res.value);
                break;
            }
        });
    }
}
