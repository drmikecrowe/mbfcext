/* eslint-disable no-param-reassign */
import { err, ok, Result } from "neverthrow";
import { isDevMode, AssociateSiteMessage, logger } from "utils";
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
    return all.divCount > 3 && all.divCount <= 5 && all.otherCount === 0;
  }

  findBlock(el_list: ElementList) {
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
  }

  getDomainNode(e: Element, top_node: Element): Result<ElementList, null> {
    if (!this.sources.isOk()) {
      return err(null);
    }
    this.addClasses(e, [C_FOUND, `${MBFC}-domain-search`]);
    const el_list = this.getResults(e, top_node);
    this.findBlock(el_list);
    if (el_list.block?.querySelector(QS_PROCESSED_SEARCH)) {
      return err(null);
    }
    if (e && e.textContent) {
      const text = e.textContent.toLowerCase().split(" ")[0];
      this.findDomain(el_list, e, text);
      if (el_list.domain) el_list.domain_span = e;
    }
    return ok(el_list);
  }

  getObjectNode(e: Element, top_node: Element): Result<ElementList, null> {
    if (!this.sources.isOk()) {
      return err(null);
    }
    this.addClasses(e, [C_FOUND, `${MBFC}-object-search`]);
    const pe = e.parentElement?.parentElement;
    if (!pe) return err(null);
    const el_list = this.getResults(pe, top_node);
    this.findBlock(el_list);
    if (el_list.block?.querySelector(QS_PROCESSED_SEARCH)) {
      return err(null);
    }
    this.findDomain(el_list, pe);
    if (el_list.domain) el_list.object = pe;
    return ok(el_list);
  }

  mergeNodes(
    domain_nodes: ElementList[], // Valid stories where we know the domain
    object_nodes: ElementList[] // Possible stories that might match domain_nodes, but may be new ones too
  ): Story[] {
    const results: Story[] = [];

    const addBlock = (dn: ElementList) => {
      if (!dn.block) {
        return;
      }
      this.addClasses(dn.block, [`${MBFC}-domain-block`]);
      const story: Story = {
        domain: dn.domain,
        parent: dn.block,
        hides: [],
        count: -1,
        ignored: false,
      };
      Array.from(dn.block.children).forEach((e) => {
        if (e.children.length === 0) return;
        if (!story.top) story.top = e;
        else {
          if (!story.report) story.report = e;
          story.hides.push(e);
        }
      });
      if (dn.title_span && dn.title_span.textContent)
        story.tagsearch = dn.title_span.textContent;
      results.push(story);
    };

    domain_nodes.forEach((dn) => {
      const pobj_nodes = object_nodes.filter(
        (on) => !on.used && on.block === dn.block // Is this the object_node for this block?
      );
      // Here we are flagging object_nodes that we are aware of that shouldn't be processed again
      pobj_nodes.forEach((on) => {
        on.used = true;
      });
      const on = pobj_nodes.shift();
      if (on && on.domain) {
        if (dn.domain?.site && on.internal_url && !dn.domain?.site.f) {
          debugger;
          new AssociateSiteMessage(
            dn.domain.site,
            on?.internal_url
          ).sendMessage();
        }
        if (!dn.domain) {
          log(`Using ${on.domain.final_domain}`);
          dn.domain = on.domain;
        }
      }
      addBlock(dn);
    });

    object_nodes
      .filter((on) => !on.used)
      .forEach((on) => {
        addBlock(on);
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
