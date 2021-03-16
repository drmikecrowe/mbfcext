import { Result, ok, err } from "neverthrow";
import { isDevMode, logger } from "utils";
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
const QS_HANDLE_SEARCH = `a[role="link"][href^="/"]`;
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

  getTwitterResults(top_node: Element): ElementList | null {
    let finding_domain = true;
    let span_nodes = top_node.querySelectorAll(QS_TITLE_SEARCH);
    if (!span_nodes || span_nodes.length !== 4) {
      span_nodes = top_node.querySelectorAll(QS_HANDLE_SEARCH);
      if (!span_nodes || span_nodes.length < 3) {
        return null;
      }
      finding_domain = false;
    }
    /**  Need 4 spans
     *      1. header
     *      2. title (tagsearch
     *      3. Text
     *      4. Domain
     */

    const check = span_nodes.length > 3 ? 3 : span_nodes.length;
    const lst: ElementList[] = Array.from(span_nodes).map((span_node) =>
      this.getResults(span_node, top_node)
    );
    const founds: Record<number, number> = {};
    for (let i = 1; i < lst.length; i++) {
      const bs = lst[i].items.map((item, j) => item === lst[0].items[j]);
      founds[i] = 0;
      while (bs.length) {
        const b = bs.shift();
        if (b) founds[i]++;
        else break;
      }
    }

    if (finding_domain) {
      const el_list = lst[check];
      if (!el_list) return null;
      el_list.block = el_list.items[founds[check]];
      this.addClasses(el_list.block, [C_FOUND, `${MBFC}-top`]);
      return el_list;
    }
    const el_list = lst[1];
    el_list.block = el_list.items[founds[1]];
    this.addClasses(el_list.block, [C_FOUND, `${MBFC}-top`]);
    return el_list;
  }

  getDomainNode(e: Element, top_node: Element): Result<ElementList, null> {
    if (!this.sources.isOk()) {
      return err(null);
    }
    this.addClasses(e, [C_FOUND, `${MBFC}-domain-search`]);
    const el_list = this.getTwitterResults(top_node);
    if (!el_list || el_list.block?.querySelector(QS_PROCESSED_SEARCH)) {
      return err(null);
    }
    const span_nodes = top_node.querySelectorAll(QS_TITLE_SEARCH);
    if (!span_nodes || span_nodes.length !== 4) {
      return err(null);
    }
    const se = span_nodes[3];
    let text;
    if (se && se.textContent) {
      text = se.textContent.toLowerCase().split(" ").pop();
      this.findDomain(el_list, se, text);
    }
    return ok(el_list);
  }

  getObjectNode(e: Element, top_node: Element): Result<ElementList, null> {
    if (!this.sources.isOk()) {
      return err(null);
    }
    this.addClasses(e, [C_FOUND, `${MBFC}-object-search`]);
    const el_list = this.getTwitterResults(top_node);
    if (!el_list || el_list.block?.querySelector(QS_PROCESSED_SEARCH)) {
      return err(null);
    }
    const span_nodes = top_node.querySelectorAll(QS_HANDLE_SEARCH);
    if (!span_nodes || span_nodes.length <= 1) {
      return err(null);
    }
    const se = span_nodes[1];
    let text;
    if (se && se.textContent) {
      try {
        const at: any = se.attributes;
        text = `https://twitter.com${at.href.value}`;
        el_list.is_twitter_handle = true;
      } catch (e) {
        if (span_nodes.length !== 6) {
          return err(null);
        }
        text = se.textContent.toLowerCase().split(" ").pop();
      }
      this.findDomain(el_list, se, text);
    }
    return ok(el_list);
  }

  mergeNodes(
    domain_nodes: ElementList[], // Valid stories where we know the domain
    object_nodes: ElementList[] // Possible stories that might match domain_nodes, but may be new ones too
  ): Story[] {
    const results: Story[] = [];

    const addBlock = (el: ElementList) => {
      if (!el.block) {
        return;
      }
      this.addClasses(el.block, [`${MBFC}-domain-block`]);
      const story: Story = {
        domain: el.domain,
        parent: el.block,
        hides: [],
        count: -1,
        ignored: false,
      };
      Array.from(el.block.children).forEach((e) => {
        if (e.children.length === 0) return;
        if (!story.top) story.top = e;
        else {
          story.hides.push(e);
        }
      });
      const children = el.block.children;
      if (!story.report) {
        if (!el.is_twitter_handle) {
          story.report = children[children.length - 1];
        } else {
          story.report = children[1];
        }
      }
      if (el.title_span && el.title_span.textContent)
        story.tagsearch = el.title_span.textContent;
      results.push(story);
    };

    const order = [domain_nodes, object_nodes];

    order[0].forEach((dn) => {
      const pobj_nodes = order[1].filter(
        (on) => !on.used && on.block === dn.block // Is this the object_node for this block?
      );
      // Here we are flagging object_nodes that we are aware of that shouldn't be processed again
      pobj_nodes.forEach((on) => {
        // eslint-disable-next-line no-param-reassign
        on.used = true;
      });
      addBlock(dn);
    });

    order[1]
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
      QS_HANDLE_SEARCH
    );
    if (stories.isErr()) return;
    stories.value.forEach((story) => {
      if (story.ignored) return;
      // eslint-disable-next-line no-param-reassign
      if (story.domain) story.domain.collapse = false;
      this.inject(story, true);
    });
  }
}
