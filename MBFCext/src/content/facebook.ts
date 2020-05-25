import { Filter } from "./filter";
import { get } from "lodash";

import debug from "debug";
import { isDevMode, toM } from "../utils/utils";
import { AssociateSiteMessage } from "../messages";
import { ISource } from "../utils/definitions";
import { getDomain } from "../utils/getDomain";
import { checkDomain } from "../utils/checkDomain";

import { icon } from "@fortawesome/fontawesome-svg-core";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons/faExternalLinkAlt";
import { faCog } from "@fortawesome/free-solid-svg-icons/faCog";
import { faEye } from "@fortawesome/free-regular-svg-icons/faEye";

isDevMode();
const log = debug("mbfc:facebook");

const MARKER = "mbfcfound";
const NOT = ":not(." + MARKER + ")";
const DATA_NODE_SEARCH = `[role="article"] ._1dwg ${NOT},div[data-pagelet^="FeedUnit"] ${NOT}`;
const ELLIPSE = "._3x-2" + NOT;
const PAGE_SEARCH = "._5x46 a.lfloat._ohe" + NOT;
const COLLAPSE_SEARCH = "._5x46" + NOT;
const ELLIPSE_SEARCH = ".ellipsis" + NOT;
const PROFILE_SEARCH = "a.profileLink" + NOT;
const TAGLINE_SEARCH = "mbs " + NOT;

export class Facebook extends Filter {
  count = 0;
  observer = null;

  constructor() {
    super();

    log(`Class Facebook started`);
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
    iDiv.className = "mbfcext " + MARKER;
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
    var drop_down = `<div class="mbfc-drop-down" onclick="el=document.getElementById('mbfctt${count}'); if (el.style.display=='none') { el.style.display='table-row'; } else { el.style.display='none'; }">${cog}</div>`;

    var details = [];
    if (site.r > "") {
      details.push(`<a title="Open MediaBiasFactCheck.com for ${site.n}" target="_blank" href="${site.u}">Factually: ${site.r}${external_link}</a>`);
    }
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

  reportAssociated(source: ISource, fb_domain: string) {
    AssociateSiteMessage.SendMessage(source, fb_domain);
  }

  inject(parent, site, user_content, collapseDivs, tagsearch, collapse) {
    if (!collapseDivs) {
      var iDiv = this.getReportDiv(site, this.count, tagsearch, collapse);
      parent.appendChild(iDiv);
      this.addButtons(site.n, this.count);
    } else {
      user_content.forEach((el) => {
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
    nodes.forEach((top_node) => {
      top_node.classList.add(MARKER);

      let final_domain, alias, baseUrl, hidden, unknown, collapse, site: ISource;

      let text;
      let els = top_node.querySelector(ELLIPSE_SEARCH);
      if (els && els.textContent) {
        text = els.textContent.toLowerCase();
      }
      let { domain, path } = getDomain(text);
      ({ final_domain, alias, baseUrl, hidden, unknown, collapse, site } = checkDomain(domain, path, this.config));

      if (!final_domain || !site) {
        const links = top_node.querySelectorAll("a");
        for (let i = 0; i < Math.min(5, links.length); i++) {
          try {
            const link = links[i];
            const href = get(link, "href");
            let { domain, path } = getDomain(href);
            if (path === "/") {
              continue;
            }
            const url = `https://${domain}${path}`.toLowerCase();
            const fb_domain = this.config.fb_pages[url];
            log(`Trying to find ${url}`, fb_domain);
            ({ domain, path } = getDomain(`https://${fb_domain}`));
            if (domain) {
              ({ final_domain, alias, baseUrl, hidden, unknown, collapse, site } = checkDomain(domain, path, this.config));
              if (final_domain) {
                log(`Found ${final_domain} from ${url}`);
                break; // Found a real domain
              }
            } else {
              log(link);
            }
          } catch (err) {
            // ignore
          }
        }
      }
      if (!final_domain || !site) {
        log(`No domain`, domain, final_domain);
        return;
      }
      var user_content = top_node.querySelectorAll(".mtm, .userContent");
      var collapseDivs = collapse ? top_node.parentNode.querySelector(".commentable_item") : null;
      var tagsearch = top_node.querySelectorAll(".mbs > a");
      if (tagsearch && tagsearch.length > 0) {
        tagsearch = tagsearch[0]["text"];
      } else {
        tagsearch = null;
      }
      this.reportSite(site, alias, baseUrl, collapse);
      this.inject(top_node, site, user_content, collapseDivs, tagsearch, collapse);
    });
  }
}
