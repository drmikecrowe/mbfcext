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
const QS_TWITTER_HANDLE = `${QS_ARTICLES} ${QS_HANDLE_SEARCH}`;
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
    const span_nodes = top_node.querySelectorAll(QS_TITLE_SEARCH);
    if (!span_nodes || span_nodes.length !== 4) {
      return null;
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
    while (found) {
      const node = lst[0].items[offset];
      for (let i = 1; i < 4; i++) {
        found = found && node === lst[i].items[offset];
      }
      if (!found) break;
      offset++;
    }

    const el_list = el_lists.domain_span;
    el_list.block = el_list.items[offset];
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
    if (!span_nodes || span_nodes.length !== 6) {
      return err(null);
    }
    const se = span_nodes[1];
    let text;
    if (se && se.textContent) {
      try {
        const at: any = se.attributes;
        text = `https://twitter.com${at.href.value}`;
      } catch (e) {
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

    object_nodes.forEach((dn) => {
      const pobj_nodes = object_nodes.filter(
        (on) => !on.used && on.block === dn.block // Is this the object_node for this block?
      );
      // Here we are flagging object_nodes that we are aware of that shouldn't be processed again
      pobj_nodes.forEach((on) => {
        // eslint-disable-next-line no-param-reassign
        on.used = true;
      });
      addBlock(dn);
    });

    domain_nodes
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
      QS_TWITTER_HANDLE
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
