import { get, isEmpty } from "lodash";

import { icon } from "@fortawesome/fontawesome-svg-core";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons/faExternalLinkAlt";
import { faAngleDoubleDown } from "@fortawesome/free-solid-svg-icons/faAngleDoubleDown";
import { faEye } from "@fortawesome/free-regular-svg-icons/faEye";
import { err, ok, Result } from "neverthrow";
import {
    isDevMode,
    ISource,
    AssociateSiteMessage,
    getDomain,
    logger,
    CheckDomainResults,
    biasShortToName,
    getSiteFromUrl,
} from "utils";
import { C_FOUND, C_NOT, C_REPORT_DIV, C_URL, Filter, MBFC } from "./filter";
import { reportingShortToName } from "utils/StorageHandler";

isDevMode();
const log = logger("mbfc:facebook");

const QS_DATA_NODE_SEARCH = `div[data-pagelet^="FeedUnit"]`;
const QS_TITLE_SEARCH = `a[role='link'] span[dir='auto'] > span > span[dir='auto']${C_NOT}`;
const QS_OBJECT_SEARCH = `a > div > object[type='nested/pressable']${C_NOT}`;
const QS_DOMAIN_SEARCH = `a[role='link'] > div > div > div > div > span[dir='auto'] > span[class]`;
const QS_ARTICLES = `[role="article"]`;
const QS_PROCESSED_SEARCH = ":scope > mbfc";

interface Story {
    domain?: CheckDomainResults;
    parent: Element;
    top: Element;
    story: Element;
    source?: Element;
    comments: Element;
    count: number;
    tagsearch?: string;
    ignored: boolean;
}

interface ElementList {
    domain?: CheckDomainResults;
    items: Element[];
    block?: Element;
    object?: Element;
    domain_span?: Element;
    title_span?: Element;
    fb_path?: string;
    used: boolean;
}

export class Facebook extends Filter {
    private static instance: Facebook;
    count = 0;
    observer = null;
    pending: any[] = [];

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

    getHiddenDiv(site: ISource, count: number, collapse: boolean) {
        const hDiv = document.createElement("mbfc");
        hDiv.className = `mbfcext ${C_FOUND}`;
        hDiv.id = `mbfcext-hide-${count}`;

        const span_id = `mbfcspan${count}`;
        const icon_id = `mbfcicon${count}`;
        const hide_class = `mbfc-hide-ctrl mbfc-hide-ctrl${count}`;
        const iconHtml = icon(faEye, {
            attributes: {
                id: icon_id,
                "aria-hidden": "true",
            },
        }).html;
        const inlineCode = `var count=${count};Array.prototype.filter.call(document.getElementsByClassName('${MBFC}elh'+count),function(e){if(e&&e.style){var t=document.getElementById('mbfcspan'+count),s=document.getElementById('mbfcicon'+count);'none'==e.style.display?(e.style.display='block',s.classList.remove('fa-eye'),s.classList.add('fa-eye-slash'),t.textContent=' Hide'):(e.style.display='none',s.classList.remove('fa-eye-slash'),s.classList.add('fa-eye'),t.textContent=' Show')}});"`;
        const hide = `<div
                class="${hide_class}"
                style="cursor: pointer"
                onclick="${inlineCode}">
                ${iconHtml}
                <span id="${span_id}"> ${
            collapse ? "Show Anyway" : "Hide this story"
        }</span>
            </div>`;
        hDiv.innerHTML = hide;
        return hDiv;
    }

    getReportDiv(site, count, tagsearch, collapse): Result<Element, null> {
        if (this.config.isErr() || this.sources.isErr()) return err(null);
        const config = this.config.value;
        const biases = this.sources.value.biases;
        const reporting = this.sources.value.reporting;

        const iDiv = document.createElement("mbfc");
        iDiv.className = `mbfcext ${C_FOUND} ${C_REPORT_DIV}`;
        iDiv.id = `mbfcext${count}`;

        const mtype = biasShortToName[site.b];

        const external_link = `&nbsp;${icon(faExternalLinkAlt).html}`;

        const hide = get(config, site.d) || collapse;
        const prompt = hide ? "show" : "hide";

        const toolbar = `<div>
            <button id="toolbar-button1-${count}" class="mbfc-drop-down mbfc-button-success mbfc-right-spacer toolbar-button1-${count}" data-domain="${site.d}" data-collapse="${prompt}">Always ${prompt} ${site.n}</button><span class="spacer">&nbsp;</span>
            <button class="mbfc-drop-down mbfc-button-warning toolbar-button3-${count}">Reset Hidden Sites</button>
            <button style="float: right;" class="mbfc-drop-down mbfc-button-secondary toolbar-button2-${count}">Say Thanks</button>
        </div>`;

        const bias_display = biases[mtype].name.replace(/ Bias(ed)?/, "");
        const bias_link = `<span class="mbfc-td-text">${bias_display}`;

        const details: string[] = [];
        if (site.r > "") {
            const reporting_obj = reporting[reportingShortToName[site.r]];
            if (!isEmpty(reporting_obj)) {
                details.push(`Factually ${reporting_obj.pretty}`);
            }
        }
        details.push(
            `<span title="Within MBFC sites, this site has ${site.P}% higher number of external equity links than other sites">Popularity: ${site.P}%</span>`
        );
        if (tagsearch && mtype !== "satire") {
            details.push(
                `<a title="Search factualsearch.news for '${tagsearch}'" target="_blank" href="https://factualsearch.news/#gsc.tab=0&fns.type=mostly-center&gsc.q=${encodeURIComponent(
                    tagsearch
                )}">Research this subject ${external_link}</a> `
            );
        }
        details.push(
            `<a title="Open MediaBiasFactCheck.com for ${site.n}" target="_blank" href="${C_URL}${site.u}">
                See MBFC's report ${external_link}
            </a>`
        );

        const cog = icon(faAngleDoubleDown, {
            attributes: {
                "aria-hidden": "true",
            },
        }).html;
        const inline_code = `el=document.getElementById('mbfctt${count}'); if (el.style.display=='none') { el.style.display='table-row'; } else { el.style.display='none'; }`;
        const drop_down = `<td width="20px" align="center"><div
            class="mbfc-drop-down"
            onclick="${inline_code}">${cog}</div></td>`;

        const buildNormalColumns = () => {
            const tdl = mtype === "left" ? bias_link : "&nbsp;";
            const tdlc = mtype === "left-center" ? bias_link : "&nbsp;";
            const tdc = mtype === "center" ? bias_link : "&nbsp;";
            const tdrc = mtype === "right-center" ? bias_link : "&nbsp;";
            const tdr = mtype === "right" ? bias_link : "&nbsp;";

            return `
                <td width="20%" class="mbfc-td mbfc-td-left">${tdl}</td>
                <td width="20%" class="mbfc-td mbfc-td-left-center">${tdlc}</td>
                <td width="20%" class="mbfc-td mbfc-td-center">${tdc}</td>
                <td width="20%" class="mbfc-td mbfc-td-right-center">${tdrc}</td>
                <td width="20%" class="mbfc-td mbfc-td-right">${tdr}</td>
            `;
        };

        const buildOtherColumns = () => {
            return `
                <td width="10%" class="mbfc-td mbfc-td-${mtype}">&nbsp;</td>
                <td width="10%" class="mbfc-td mbfc-td-${mtype}">&nbsp;</td>
                <td width="60%" class="mbfc-td mbfc-td-${mtype}">${bias_link}</td>
                <td width="10%" class="mbfc-td mbfc-td-${mtype}">&nbsp;</td>
                <td width="10%" class="mbfc-td mbfc-td-${mtype}">&nbsp;</td>
            `;
        };

        let columns;

        switch (biasShortToName[site.b]) {
            case "satire":
            case "conspiracy":
            case "fake-news":
            case "pro-science":
                columns = buildOtherColumns();
                break;
            default:
                columns = buildNormalColumns();
                break;
        }

        const details_contents = `<div class="mbfc-td mbfc-td-text">
            ${details.join(", &nbsp;")}
        </div>`;

        const table = `
<div class="">
    <table class="mbfc-table-table" cellpadding="0" border="0">
        <tbody>
            <tr>
                ${columns}${drop_down}
            </tr>
            <tr id="mbfctt${count}" class="mbfc-td-text" style="display:none">
                <td colspan="6">
                    ${toolbar}
                </td>
            </tr>
            <tr>
                <td colspan="6" align="center">
                    ${details_contents}
                </td>
            </tr>
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

    private allDivs(e: Element, _i: number, _found: boolean): boolean {
        const all = Array.from(e.children).reduce(
            (sum, cv) => {
                if (cv.tagName === "DIV") sum.divCount++;
                else if (cv.tagName !== "MBFC") sum.otherCount++;
                return sum;
            },
            {
                divCount: 0,
                otherCount: 0,
            }
        );
        return all.divCount > 3 && all.divCount <= 5 && all.otherCount == 0;
    }

    private getDomainFromFb(el: ElementList): Result<CheckDomainResults, null> {
        if (this.sources.isOk() && el.fb_path) {
            const sources = this.sources.value;
            if (sources.fb_pages[el.fb_path]) {
                const fb_domain = sources.fb_pages[el.fb_path];
                const url = `https://${fb_domain}`.toLowerCase();
                const res = getSiteFromUrl(url);
                if (res.isOk()) {
                    return ok(res.value);
                }
            }
        }
        return err(null);
    }

    private getResults(e: Element, top_node: Element): ElementList {
        let found = false;
        const results: ElementList = {
            items: [e],
            used: false,
        };
        let t = e.parentElement;
        let count = 0;
        while (t && t !== top_node) {
            if (this.allDivs(t, count++, found) && !found) {
                results.block = t;
                found = true;
                const span = t.querySelector(QS_TITLE_SEARCH);
                if (span) {
                    this.addClasses(span, [C_FOUND]);
                    if (count >= 4) results.title_span = span;
                }
            }
            results.items.unshift(t);
            t = t?.parentElement;
        }
        return results;
    }

    getDomainNodes(top_node: Element): ElementList[] {
        const results: ElementList[] = [];
        if (!this.sources.isOk()) {
            return results;
        }
        Array.from(top_node.querySelectorAll(QS_DOMAIN_SEARCH))
            // .filter((h) => !h.children.length && h.classList.length > 0)
            .forEach((e) => {
                this.addClasses(e, [C_FOUND]);
                let text;
                if (e && e.textContent) {
                    text = e.textContent.toLowerCase().split(" ")[0];
                }
                const res = getSiteFromUrl(text);
                if (res.isErr()) return;
                const el = this.getResults(e, top_node);
                if (el.block?.querySelector(QS_PROCESSED_SEARCH)) {
                    return;
                }
                el.domain = res.value;
                el.domain_span = e;
                results.push(el);
            });
        return results;
    }

    getObjectNodes(top_node: Element): ElementList[] {
        const results: ElementList[] = [];
        if (!this.sources.isOk()) {
            return results;
        }
        Array.from(top_node.querySelectorAll(QS_OBJECT_SEARCH)).forEach(
            (ce) => {
                this.addClasses(ce, [C_FOUND]);
                const e = ce.parentElement?.parentElement;
                if (!e) return;
                const href = get(e, "href");
                if (!href || !href.startsWith("http")) return;
                const { domain, path } = getDomain(href);
                if (path === "/") {
                    debugger;
                    return;
                }
                const el = this.getResults(e, top_node);
                if (el.block?.querySelector(QS_PROCESSED_SEARCH)) {
                    return;
                }
                if (domain.toLowerCase().indexOf("facebook") === -1) {
                    debugger;
                    return;
                }
                // DEBUG HERE
                el.object = e;
                el.fb_path = path.toLowerCase();
                el.object = e;
                results.push(el);
            }
        );
        return results;
    }

    mergeNodes(
        domain_nodes: ElementList[], // Valid stories where we know the domain
        object_nodes: ElementList[] // Possible stories that might match domain_nodes, but may be new ones too
    ): Story[] {
        const results: Story[] = [];

        const addBlock = (dn: ElementList) => {
            if (!dn.block) {
                // debugger;
                return;
            }
            let story: Story;
            if (dn.block.children.length === 3) {
                story = {
                    domain: dn.domain,
                    parent: dn.block,
                    top: dn.block.children[0],
                    story: dn.block.children[1],
                    comments: dn.block.children[2],
                    count: -1,
                    ignored: false,
                };
            } else {
                story = {
                    domain: dn.domain,
                    parent: dn.block,
                    top: dn.block.children[0],
                    source: dn.block.children[1],
                    story: dn.block.children[2],
                    comments: dn.block.children[3],
                    count: -1,
                    ignored: false,
                };
            }
            if (dn.title_span && dn.title_span.textContent)
                story.tagsearch = dn.title_span.textContent;
            results.push(story);
        };

        domain_nodes.forEach((dn) => {
            const ready = !!dn.domain && !!dn.domain.site;
            const have_fburl = !!dn.fb_path;

            const pobj_nodes = object_nodes.filter(
                (on) => !on.used && on.block === dn.block // Is this the object_node for this block?
            );
            // Here we are flagging object_nodes that we are aware of that shouldn't be processed again
            pobj_nodes.forEach((on) => {
                on.used = true;
            });
            const on = pobj_nodes.shift();
            if (on && (!ready || !have_fburl)) {
                const res = this.getDomainFromFb(on);
                let ndomain: CheckDomainResults | undefined;
                if (res.isOk()) {
                    ndomain = res.value;
                    log(`Found ${ndomain.final_domain} from ${on.fb_path}`);
                }
                if (ndomain) {
                    if (!ready) dn.domain = ndomain;
                    if (
                        dn.domain &&
                        dn.domain.site &&
                        !have_fburl &&
                        on.fb_path
                    ) {
                        new AssociateSiteMessage(
                            dn.domain.site,
                            on.fb_path
                        ).sendMessage();
                    }
                }
            }
            addBlock(dn);
        });

        object_nodes
            .filter((on) => !on.used)
            .forEach((on) => {
                const res = this.getDomainFromFb(on);
                if (res.isOk()) {
                    on.domain = res.value;
                    addBlock(on);
                }
            });
        return results;
    }

    getStoryNodes(parents: Element[]): Result<Story[], null> {
        try {
            const results: Story[] = [];
            const nodes: Element[] = [
                ...document.querySelectorAll(QS_DATA_NODE_SEARCH),
                ...parents,
            ];
            nodes.forEach((node) => {
                node.querySelectorAll(QS_ARTICLES).forEach((top_node) => {
                    const domain_nodes = this.getDomainNodes(top_node);
                    const object_nodes = this.getObjectNodes(top_node);
                    if (domain_nodes.length + object_nodes.length > 0) {
                        const stories = this.mergeNodes(
                            domain_nodes,
                            object_nodes
                        );
                        results.push(...stories);
                    }
                });
            });
            return ok(results);
        } catch (err) {
            // ignore
        }
        return err(null);
    }

    inject(story: Story) {
        if (!story.domain || !story.domain.site) {
            return;
        }
        if (story.parent.querySelector(MBFC)) {
            return;
        }
        const { site, collapse } = story.domain;
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
        this.addClasses(story.comments, [C_FOUND]);
        story.parent.insertBefore(iDiv.value, story.comments);
        story.count = this.count;
        this.addButtons(site.n, this.count);
        const hDiv = this.getHiddenDiv(site, this.count, collapse);
        story.parent.appendChild(hDiv);
        this.count++;
        const domain_class = `${MBFC}-${story.domain.final_domain.replace(
            /\./g,
            "-"
        )}`;
        this.addClasses(story.story, [domain_class]);
        let sib = story.parent.querySelector("mbfc")?.nextSibling;
        while (sib) {
            if (sib && ["DIV", "MBFC"].indexOf((sib as Element).tagName) > -1)
                this.addClasses(sib as Element, [domain_class]);
            sib = sib.nextSibling;
        }
        if (collapse) {
            story.parent.querySelectorAll(`.${domain_class}`).forEach((e) => {
                this.hideElement(e, story.count);
            });
        }
    }

    process(parents: Element[]) {
        const stories = this.getStoryNodes(parents);
        if (stories.isErr()) return;
        stories.value.forEach((story) => {
            if (story.ignored) return;
            this.inject(story);
        });
    }
}
