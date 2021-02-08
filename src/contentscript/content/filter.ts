import debug from "debug";
import { get, has, isEmpty, set } from "lodash-es";
import { err, ok, Result } from "neverthrow";
import {
  AssociateSiteMessage,
  biasShortToName,
  CheckDomainResults,
  getSiteFromUrl,
  HideSiteMessage,
  IConfig,
  isDevMode,
  ISources,
  reportingShortToName,
  ReportUnknownMessage,
  ResetIgnoredMessage,
  ShowSiteMessage,
  StartThanksMessage,
  UpdatedSourcesMessage,
} from "utils";
import { ConfigHandler } from "utils/ConfigHandler";
import {
  ISource,
  EReportingText,
  ECredibility,
  ETraffic,
} from "utils/definitions";
import {
  faAngleDoubleDown,
  faExternalLinkAlt,
  faEye,
} from "utils/elements/font-awesome";
import { messageUtil } from "utils/messages/messageUtil";
import { UpdatedConfigMessage } from "utils/messages/UpdatedConfigMessage";
import { SourcesHandler } from "utils/SourcesHandler";

export const MBFC = "mbfc";
export const C_URL = "https://mediabiasfactcheck.com/";
export const C_FOUND = `${MBFC}-found`;
export const C_REPORT_DIV = `${MBFC}-report-div`;
export const C_PARENT = `${MBFC}-parent`;
export const QS_PROCESSED_SEARCH = ":scope > mbfc";

export interface Story {
  domain?: CheckDomainResults;
  parent: Element;
  report?: Element;
  top?: Element;
  hides: Element[];
  count: number;
  tagsearch?: string;
  ignored: boolean;
}

export interface ElementList {
  domain?: CheckDomainResults;
  items: Element[];
  block?: Element;
  object?: Element;
  domain_span?: Element;
  title_span?: Element;
  used: boolean;
  internal_url?: string;
}

isDevMode();
const log = debug("mbfc:filter");

export class Filter {
  config: Result<IConfig, null>;
  sources: Result<ISources, null>;
  unknown: any = {};
  loaded = false;
  windowObjectReference: Window | null = null;
  count = 0;

  constructor() {
    log(`Class Filter started`);
    this.config = ConfigHandler.getInstance().config;
    this.sources = SourcesHandler.getInstance().sources;
    messageUtil.receive(UpdatedConfigMessage.method, () => {
      this.config = ConfigHandler.getInstance().config;
      this.loaded = this.config.isOk() && this.sources.isOk();
      this.process([]);
    });
    messageUtil.receive(UpdatedSourcesMessage.method, () => {
      this.sources = SourcesHandler.getInstance().sources;
      this.loaded = this.config.isOk() && this.sources.isOk();
      this.process([]);
    });
    log(`MutationObserver started`);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        const parents: Element[] = [];

        const handleNodes = (newNodes: NodeList) => {
          if (newNodes !== null) {
            newNodes.forEach((n) => {
              const p = n.parentElement;
              if (!p) return;
              if (p.id.startsWith("mount")) return;
              if (p.tagName === "DIV") {
                if (parents.filter((pe) => pe !== p)) parents.push(p);
              }
            });
          }
        };

        handleNodes(mutation.addedNodes);
        this.cleanMbfcNodes(mutation.removedNodes);
        handleNodes(mutation.removedNodes);
        if (parents.length) this.process(parents);
      });
    });

    observer.observe(document, {
      childList: true,
      subtree: true,
      attributes: false,
      characterData: false,
    });
  }

  cleanMbfcNodes(qn: NodeList | Element[]) {
    qn.forEach((qne) => {
      const e: Element = qne as Element;
      if (!e.querySelectorAll) return;
      if (!e.querySelector(`.${MBFC}`)) return;
      if (e.tagName === "MBFC") {
        if (e.parentElement) this.cleanMbfcNodes([e.parentElement]);
        e.remove();
      } else {
        e.querySelectorAll(MBFC).forEach((mbfc) => {
          mbfc.remove();
        });
        e.querySelectorAll(`.${MBFC}`).forEach((p) => {
          p.classList.forEach((cls) => {
            if (cls.startsWith(MBFC)) p.classList.remove(cls);
          });
        });
      }
    });
  }

  addClasses(e: Element, cls: string[]) {
    cls.forEach((c) => {
      if (!e.classList.contains(c)) e.classList.add(c);
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  process(_parents: Element[]) {
    throw new Error("Must be overloaded");
  }

  waitForElementToDisplay(selector, time, cb) {
    const el = document.querySelector(selector);
    if (el != null) {
      cb(el);
    } else {
      setTimeout(() => {
        this.waitForElementToDisplay(selector, time, cb);
      }, time);
    }
  }

  storyClass(count: number): string {
    return `${MBFC}-story-${count}`;
  }

  hideElement(el) {
    if (el && el.tagName !== "MBFC") {
      set(el, "style.display", "none");
    }
  }

  showElement(el) {
    if (el) {
      set(el, "style.display", "inherit");
    }
  }

  thanksButton() {
    this.openRequestedPopup();
  }

  ignoreButton(text, count) {
    if (this.config.isErr()) return;
    const button = document.getElementById(`toolbar-button1-${count}`);
    if (!button) return;
    const domain = button.attributes["data-domain"].value;
    const collapse = button.attributes["data-collapse"].value !== "show";
    log(domain, button.attributes["data-collapse"].value, collapse);
    const which = collapse ? "hiding" : "showing";
    log(`Always ${which} ${text}/${domain}`);
    new HideSiteMessage(domain, collapse).sendMessage();
    const el = document.getElementById(`mbfcext${count}`);
    if (el) {
      el.style.display = collapse ? "none" : "inherit";
    }
    const domain_class = `${MBFC}-${domain.replace(/\./g, "-")}`;
    if (collapse) {
      document.querySelectorAll(`.${domain_class}`).forEach((e) => {
        this.hideElement(e);
      });
      document
        .querySelectorAll(`button[data-domain="${domain}"]`)
        .forEach((e) => {
          e.setAttribute("data-collapse", "show");
          e.textContent = e.textContent?.replace("hide", "show") || "";
        });
    } else {
      document.querySelectorAll(`.${domain_class}`).forEach((e) => {
        this.showElement(e);
      });
      document
        .querySelectorAll(`button[data-domain="${domain}"]`)
        .forEach((e) => {
          e.setAttribute("data-collapse", "hide");
          e.textContent = e.textContent?.replace("show", "hide") || "";
        });
    }
    alert(`Always ${which} ${text}/${domain}`);
    const el2 = document.getElementById(`mbfctt${count}`);
    if (!el2) return;
    if (el2.style.display == "none") {
      el2.style.display = "table-row";
    } else {
      el2.style.display = "none";
    }
  }

  reportSite(
    site: ISource,
    isAlias: boolean,
    isBase: boolean,
    isCollapsed: boolean
  ) {
    new ShowSiteMessage(site, isAlias, isBase, isCollapsed).sendMessage();
  }

  reportUnknown(domain: string) {
    new ReportUnknownMessage(domain).sendMessage();
  }

  resetIgnored() {
    new ResetIgnoredMessage().sendMessage();
    alert(`OK, reset. You can now begin to hide/show individual sites`);
  }

  reportAssociated(source: ISource, domain: string) {
    new AssociateSiteMessage(source, domain).sendMessage();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getDomainNode(e: Element, top_node: Element): Result<ElementList, null> {
    throw new Error("Must be overridden");
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getObjectNode(e: Element, top_node: Element): Result<ElementList, null> {
    throw new Error("Must be overridden");
  }

  mergeNodes(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    domain_nodes: ElementList[], // Valid stories where we know the domain
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    object_nodes: ElementList[] // Possible stories that might match domain_nodes, but may be new ones too
  ): Story[] {
    throw new Error("Must be overridden");
  }

  openRequestedPopup() {
    new StartThanksMessage().sendMessage();
    this.windowObjectReference = window.open(
      "https://paypal.me/drmikecrowe",
      "DescriptiveWindowName",
      "resizable,scrollbars,status"
    );
  }

  addButtons(text, count) {
    this.waitForElementToDisplay(`.toolbar-button1-${count}`, 500, (button) => {
      button.addEventListener(
        "click",
        () => this.ignoreButton(text, count),
        false
      );
    });
    this.waitForElementToDisplay(`.toolbar-button2-${count}`, 500, (button) => {
      button.addEventListener("click", () => this.thanksButton(), false);
    });
    this.waitForElementToDisplay(`.toolbar-button3-${count}`, 500, (button) => {
      button.addEventListener("click", () => this.resetIgnored(), false);
    });
  }

  findDomain(el_list: ElementList, e?: Element, text_input?: string) {
    if (text_input) {
      const text = text_input.toLowerCase().split(" ")[0];
      if (text.indexOf(".") > -1) {
        const res = getSiteFromUrl(text);
        if (res.isOk()) {
          set(el_list, "domain", res.value);
          return;
        }
      }
    }
    if (!e) return;
    // Here we see if the domain span is a plain-text link rather than a domain name
    const pe = e.parentElement?.parentElement;
    if (pe) {
      const href = get(pe, "href");
      if (href) {
        this.findDomain(el_list, undefined, href);
        if (el_list.domain) {
          set(el_list, "internal_url", text_input);
        }
      }
    }
  }

  getHiddenDiv(site: ISource, count: number, collapse: boolean) {
    const hDiv = document.createElement("mbfc");
    hDiv.className = `mbfcext ${C_FOUND}`;
    hDiv.id = `mbfcext-hide-${count}`;

    const story_class = this.storyClass(count);
    const span_id = `${story_class}-span`;
    const icon_id = `${story_class}-icon`;
    const hide_classes = `mbfc mbfc-hide-ctrl mbfc-hide-ctrl${count}`;
    const inlineCode = `
            var icon=document.getElementById('${icon_id}'),
                span=document.getElementById('${span_id}');
            Array.from(document.getElementsByClassName('${story_class}')).forEach(function(e) {
                if(e && e.style) {
                    if (e.style.display === 'none') {
                        e.style.display = 'block';
                        icon.classList.remove('fa-eye');
                        icon.classList.add('fa-eye-slash');
                        span.textContent=' Hide'
                    } else {
                        e.style.display = 'none';
                        icon.classList.remove('fa-eye-slash');
                        icon.classList.add('fa-eye');
                        span.textContent=' Show'
                    }
                }
            });
        `;
    const hide = collapse
      ? `<div
                class="${hide_classes}"
                style="cursor: pointer"
                onclick="${inlineCode}">
                ${faEye}
                <span id="${span_id}"> Show Anyway</span>
            </div>`
      : "";
    set(hDiv, "innerHTML", hide);
    return hDiv;
  }

  getReportDiv(
    site,
    count,
    tagsearch,
    collapse,
    embed = false
  ): Result<Element, null> {
    if (this.config.isErr() || this.sources.isErr()) return err(null);
    const config = this.config.value;
    const { biases } = this.sources.value;
    const { reporting } = this.sources.value;

    const iDiv = document.createElement("mbfc");
    iDiv.className = `mbfcext ${C_FOUND} ${C_REPORT_DIV}`;
    iDiv.id = `mbfcext${count}`;

    const mtype = biasShortToName[site.b];

    const external_link = `&nbsp;${faExternalLinkAlt}`;

    const hide = get(config, site.d) || collapse;
    const prompt = hide ? "show" : "hide";

    const toolbar = `<div>
            <button id="toolbar-button1-${count}" class="mbfc-drop-down mbfc-button-success mbfc-right-spacer toolbar-button1-${count}" data-domain="${site.d}" data-collapse="${prompt}">Always ${prompt} ${site.n}</button><span class="spacer">&nbsp;</span>
            <button class="mbfc-drop-down mbfc-button-warning toolbar-button3-${count}">Reset Hidden Sites</button>
            <button style="float: right; margin-right: 20px;" class="mbfc-drop-down mbfc-button-secondary toolbar-button2-${count}">Say Thanks</button>
        </div>`;

    const bias_display = biases[mtype].name.replace(/ Bias(ed)?/, "");
    const bias_link = `<span class="mbfc-td-text">${bias_display}`;

    const details: string[] = [];
    if (site.r > "") {
      if (has(EReportingText, site.r)) {
        details.push(EReportingText[site.r]);
      }
    }
    if (site.c > "" && site.c !== "NA") {
      details.push(ECredibility[site.c]);
    }
    if (site.a > "" && site.a !== "N") {
      details.push(ETraffic[site.a]);
    }
    details.push(
      `<span title="Within our rated sites, this site has ${site.P}% higher number of sites linking to it than other sites">Links: ${site.P}%</span>`
    );
    if (tagsearch && mtype !== "satire") {
      details.push(
        `<a title="Search factualsearch.news for '${tagsearch}'" target="_blank" href="https://factualsearch.news/#gsc.tab=0&fns.type=mostly-center&gsc.q=${encodeURIComponent(
          tagsearch
        )}">Research ${external_link}</a> `
      );
    }
    details.push(
      `<a title="Open MediaBiasFactCheck.com for ${site.n}" target="_blank" href="${C_URL}${site.u}">
                MBFC's ${external_link}
            </a>`
    );

    const inline_code = `el=document.getElementById('mbfctt${count}'); if (el.style.display=='none') { el.style.display='table-row'; } else { el.style.display='none'; }`;
    const drop_down = embed
      ? ""
      : `<td width="20px" align="center"><div
            class="mbfc-drop-down"
            onclick="${inline_code}">${faAngleDoubleDown}</div></td>`;

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

    const details_contents = `<div class="mbfc-details mbfc-td mbfc-td-text">
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

    set(iDiv, "innerHTML", table);
    return ok(iDiv);
  }

  getResults(e: Element, top_node: Element): ElementList {
    const results: ElementList = {
      items: [e],
      used: false,
    };
    let t = e.parentElement;
    while (t && t !== top_node) {
      results.items.unshift(t);
      t = t?.parentElement;
    }
    return results;
  }

  getStoryNodes(
    nodes: Element[],
    qs_articles: string,
    qs_domain_search: string,
    qs_object_search?: string
  ): Result<Story[], null> {
    try {
      const results: Story[] = [];
      if (this.sources.isOk()) {
        nodes.forEach((node) => {
          node.querySelectorAll(qs_articles).forEach((top_node) => {
            const domain_nodes: ElementList[] = [];
            const object_nodes: ElementList[] = [];
            Array.from(top_node.querySelectorAll(qs_domain_search)).forEach(
              (e) => {
                const res = this.getDomainNode(e, top_node);
                if (res.isOk()) {
                  domain_nodes.push(res.value);
                }
              }
            );
            if (qs_object_search) {
              Array.from(top_node.querySelectorAll(qs_object_search)).forEach(
                (e) => {
                  const res = this.getObjectNode(e, top_node);
                  if (res.isOk()) {
                    object_nodes.push(res.value);
                  }
                }
              );
            }
            if (domain_nodes.length + object_nodes.length > 0) {
              const stories = this.mergeNodes(domain_nodes, object_nodes);
              results.push(...stories);
            }
          });
        });
      }
      return ok(results);
    } catch (err1) {
      // ignore
      if (isDevMode()) debugger;
    }
    return err(null);
  }

  inject(story: Story, embed = false) {
    if (!story.domain || !story.domain.site) {
      return;
    }
    if (story.parent.querySelector(MBFC)) {
      return;
    }
    set(story, "count", this.count);
    this.count += 1;
    const { site, collapse } = story.domain;
    const iDiv = this.getReportDiv(
      site,
      story.count,
      story.tagsearch,
      collapse,
      embed
    );
    if (iDiv.isErr()) {
      log("ERROR: iDiv empty");
      return;
    }
    if (story.report) story.parent.insertBefore(iDiv.value, story.report);
    this.addButtons(site.n, story.count);
    const hDiv = this.getHiddenDiv(site, story.count, collapse);
    story.parent.appendChild(hDiv);
    const domain_class = `${MBFC}-${story.domain.final_domain.replace(
      /\./g,
      "-"
    )}`;
    story.hides.forEach((e) => {
      this.addClasses(e, [domain_class, this.storyClass(story.count)]);
    });
    if (collapse) {
      story.hides.forEach((e) => {
        this.hideElement(e);
      });
    }
    this.reportSite(
      story.domain.site,
      story.domain.alias,
      story.domain.baseUrl,
      collapse
    );
  }
}
