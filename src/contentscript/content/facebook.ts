import { get } from "lodash";
import { err, ok, Result } from "neverthrow";
import {
    isDevMode,
    AssociateSiteMessage,
    getDomain,
    logger,
    CheckDomainResults,
    getSiteFromUrl,
} from "utils";
import {
    C_FOUND,
    ElementList,
    Filter,
    MBFC,
    QS_PROCESSED_SEARCH,
    Story,
} from "./filter";

isDevMode();
const log = logger("mbfc:facebook");

const QS_DATA_NODE_SEARCH = `div[data-pagelet^="FeedUnit"]`;
const QS_ARTICLES = `[role="article"]`;
const QS_DOMAIN_SEARCH = `a[role='link'] > div > div > div > div > span[dir='auto'] > span[class],a[role='link'] > strong > span`;
const QS_TITLE_SEARCH = `a[role='link'] span[dir='auto'] > span > span[dir='auto']`;
const QS_OBJECT_SEARCH = `a > div > object[type='nested/pressable']`;

export class Facebook extends Filter {
    private static instance: Facebook;
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

    private allDivs(e: Element): boolean {
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

    getDomainFromFacebook(el: ElementList): Result<CheckDomainResults, null> {
        if (this.sources.isOk()) {
            return this.getDomainFromString(el, this.sources.value.fb_pages);
        }
        return err(null);
    }

    getDomainNode(e: Element, top_node: Element): Result<ElementList, null> {
        if (!this.sources.isOk()) {
            return err(null);
        }
        this.addClasses(e, [C_FOUND, `${MBFC}-domain-search`]);
        let text;
        if (e && e.textContent) {
            text = e.textContent.toLowerCase().split(" ")[0];
        }
        const el_list = this.getResults(e, top_node);
        let res = getSiteFromUrl(text);
        if (res.isErr()) {
            // Here we see if the domain span is a plain-text link rather than a domain name
            const pe = e.parentElement?.parentElement;
            if (!pe) return err(null);
            const href = get(pe, "href");
            if (href && href.startsWith("https://www.facebook")) {
                const { path } = getDomain(href);
                if (path === "/") {
                    if (isDevMode()) debugger;
                    return err(null);
                }
                el_list.sm_path = path.toLowerCase();
                res = this.getDomainFromFacebook(el_list);
                if (res.isErr()) {
                    return err(null);
                }
            }
        }
        let count = 0;
        let found = false;
        for (let i = el_list.items.length - 1; i >= 0; i--) {
            const t = el_list.items[i];
            if (this.allDivs(t) && !found) {
                el_list.block = t;
                found = true;
                const span = t.querySelector(QS_TITLE_SEARCH);
                if (span) {
                    this.addClasses(span, [C_FOUND, `${MBFC}-title-search`]);
                    if (count >= 4) el_list.title_span = span;
                }
            }
            count++;
        }
        if (el_list.block?.querySelector(QS_PROCESSED_SEARCH)) {
            return err(null);
        }
        if (res.isOk()) el_list.domain = res.value;
        el_list.domain_span = e;
        return ok(el_list);
    }

    getObjectNode(e: Element, top_node: Element): Result<ElementList, null> {
        if (!this.sources.isOk()) {
            return err(null);
        }
        this.addClasses(e, [C_FOUND, `${MBFC}-object-search`]);
        const pe = e.parentElement?.parentElement;
        if (!pe) return err(null);
        const href = get(pe, "href");
        if (!href || !href.startsWith("http")) return err(null);
        const { domain, path } = getDomain(href);
        if (path === "/") {
            if (isDevMode()) debugger;
            return err(null);
        }
        const el = this.getResults(pe, top_node);
        if (el.block?.querySelector(QS_PROCESSED_SEARCH)) {
            return err(null);
        }
        if (domain.toLowerCase().indexOf("facebook") === -1) {
            if (isDevMode()) debugger;
            return err(null);
        }
        // DEBUG HERE
        el.object = pe;
        el.sm_path = path.toLowerCase();
        el.object = pe;
        return ok(el);
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
            const have_fburl = !!dn.sm_path;

            const pobj_nodes = object_nodes.filter(
                (on) => !on.used && on.block === dn.block // Is this the object_node for this block?
            );
            // Here we are flagging object_nodes that we are aware of that shouldn't be processed again
            pobj_nodes.forEach((on) => {
                on.used = true;
            });
            const on = pobj_nodes.shift();
            if (on && (!ready || !have_fburl)) {
                const res = this.getDomainFromFacebook(on);
                let ndomain: CheckDomainResults | undefined;
                if (res.isOk()) {
                    ndomain = res.value;
                    log(`Found ${ndomain.final_domain} from ${on.sm_path}`);
                }
                if (ndomain) {
                    if (!ready) dn.domain = ndomain;
                    if (
                        dn.domain &&
                        dn.domain.site &&
                        !have_fburl &&
                        on.sm_path
                    ) {
                        new AssociateSiteMessage(
                            dn.domain.site,
                            on.sm_path
                        ).sendMessage();
                    }
                }
            }
            addBlock(dn);
        });

        object_nodes
            .filter((on) => !on.used)
            .forEach((on) => {
                const res = this.getDomainFromFacebook(on);
                if (res.isOk()) {
                    on.domain = res.value;
                    addBlock(on);
                }
            });
        return results;
    }

    process(parents: Element[]) {
        const nodes: Element[] = [
            ...document.querySelectorAll(QS_DATA_NODE_SEARCH),
            ...parents,
        ];
        const stories = this.getStoryNodes(
            nodes,
            QS_ARTICLES,
            QS_DOMAIN_SEARCH,
            QS_OBJECT_SEARCH
        );
        if (stories.isErr()) return;
        stories.value.forEach((story) => {
            if (story.ignored) return;
            this.inject(story);
        });
    }
}
