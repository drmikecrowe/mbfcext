import { Result, ok, err } from "neverthrow";
import { CheckDomainResults, getSiteFromUrl, isDevMode, logger } from "utils";
import {
    C_FOUND,
    ElementList,
    Filter,
    MBFC,
    QS_PROCESSED_SEARCH,
    Story,
} from "./filter";

isDevMode();
const log = logger("mbfc:twitter");

const QS_DATA_NODE_SEARCH = `div[aria-label*="Timeline:"]`;
const QS_ARTICLES = `article`;
const QS_DOMAIN_SEARCH = '[data-testid="tweet"]';
const QS_TITLE_SEARCH = `a[role='link'] > div > div > div > span span`;
// const QS_TWITTER_HANDLE = `${QS_ARTICLES} a[aria-haspopup="false"]`;
// const QS_RETWEET = `${QS_ARTICLES} a[target='_blank'] svg`;

export class Twitter extends Filter {
    private static instance: Twitter;
    observer = null;

    constructor() {
        super();

        log(`Class Twitter started`);
    }

    static getInstance(): Twitter {
        if (!Twitter.instance) {
            Twitter.instance = new Twitter();
        }
        return Twitter.instance;
    }

    getDomainFromTwitter(el: ElementList): Result<CheckDomainResults, null> {
        if (this.sources.isOk()) {
            return this.getDomainFromString(el, this.sources.value.tw_pages);
        }
        return err(null);
    }

    getDomainNode(e: Element, top_node: Element): Result<ElementList, null> {
        this.addClasses(e, [C_FOUND, `${MBFC}-domain-search`]);
        const span_nodes = top_node.querySelectorAll(QS_TITLE_SEARCH);
        if (!span_nodes || span_nodes.length !== 4) {
            return err(null);
        }
        /**  Need 4 spans
         *      1. header
         *      2. title (tagsearch
         *      3. Text
         *      4. Domain
         */

        const el_lists = {
            header: this.getResults(span_nodes[0], top_node),
            title_span: this.getResults(span_nodes[1], top_node),
            title: this.getResults(span_nodes[2], top_node),
            domain_span: this.getResults(span_nodes[3], top_node),
        };
        let offset = 0;
        let found = true;
        const lst = Object.values(el_lists);
        while (!found) {
            const node = lst[0][offset];
            for (let i = 0; i < 4; i++) {
                found = found && node === lst[i][offset];
            }
            if (!found) break;
            offset++;
        }

        const result = el_lists.domain_span;
        result.block = result.items[offset];
        this.addClasses(result.block, [C_FOUND, `${MBFC}-top`]);

        if (result.block?.querySelector(QS_PROCESSED_SEARCH)) {
            return err(null);
        }
        const se = span_nodes[3];
        let text;
        if (se && se.textContent) {
            text = se.textContent.toLowerCase().split(" ")[0];
            const res = getSiteFromUrl(text);
            if (res.isOk()) {
                result.domain = res.value;
                result.domain_span = se;
            }
        }
        return ok(result);
    }

    mergeNodes(
        domain_nodes: ElementList[], // Valid stories where we know the domain
        object_nodes: ElementList[] // Possible stories that might match domain_nodes, but may be new ones too
    ): Story[] {
        const results: Story[] = [];

        const addBlock = (dn: ElementList) => {
            if (!dn.block) {
                // if (isDevMode()) debugger;
                return;
            }
            if (isDevMode()) debugger;
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
            // const ready = !!dn.domain && !!dn.domain.site;
            // const have_fburl = !!dn.sm_path;

            // const pobj_nodes = object_nodes.filter(
            //     (on) => !on.used && on.block === dn.block // Is this the object_node for this block?
            // );
            // // Here we are flagging object_nodes that we are aware of that shouldn't be processed again
            // pobj_nodes.forEach((on) => {
            //     on.used = true;
            // });
            // const on = pobj_nodes.shift();
            // if (on && (!ready || !have_fburl)) {
            //     const res = this.getDomainFromFb(on);
            //     let ndomain: CheckDomainResults | undefined;
            //     if (res.isOk()) {
            //         ndomain = res.value;
            //         log(`Found ${ndomain.final_domain} from ${on.sm_path}`);
            //     }
            //     if (ndomain) {
            //         if (!ready) dn.domain = ndomain;
            //         if (
            //             dn.domain &&
            //             dn.domain.site &&
            //             !have_fburl &&
            //             on.sm_path
            //         ) {
            //             new AssociateSiteMessage(
            //                 dn.domain.site,
            //                 on.sm_path
            //             ).sendMessage();
            //         }
            //     }
            // }
            addBlock(dn);
        });

        object_nodes
            .filter((on) => !on.used)
            .forEach((on) => {
                const res = this.getDomainFromTwitter(on);
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
            QS_DOMAIN_SEARCH
        );
        if (stories.isErr()) return;
        stories.value.forEach((story) => {
            if (story.ignored) return;
            this.inject(story);
        });
    }
}
