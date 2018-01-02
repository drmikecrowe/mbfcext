(function () {
  var loaded  = false;
  var verbose = false;
  var windowObjectReference;

  var config;
  var unknown = {};

  function isDevMode() {
    var obj = chrome.runtime.getManifest();
    return !('update_url' in obj);
  }

  verbose = isDevMode();

  function log() {
    if (!verbose) {
      return;
    }
    console.log(Array.prototype.slice.call(arguments));

  }

  function loadSettings() {
    chrome.runtime.sendMessage({method: "setup"}, function (response, b, c) {
      if (response && response.data && response.data.hiddenSites) {
        config                   = response.data;
        config.marker            = config.marker || 'mbfcfound';
        config.not               = ':not(.' + config.marker + ')';
        config.data_node_search  = config.data_node_search  || '[role="article"] ._1dwg' + config.not;
        config.ellipse_placement = config.ellipse_placement || '._3x-2' + config.not;
        config.fb_page_search    = config.fb_page_search    || '._5x46 a.lfloat._ohe' + config.not;
        config.collapse_search   = config.collapse_search   || '._5x46' + config.not;
        config.ellipses_search   = config.ellipses_search   || '.ellipsis' + config.not;
        config.profile_search    = config.profile_search    || 'a.profileLink' + config.not;
        config.tagline_search    = config.tagline_search    || 'mbs ' + config.not;
        loaded                   = true;
        process();
      }
    });
  }

  function waitForElementToDisplay(selector, time, cb) {
    var el = document.querySelector(selector);
    if (el != null) {
      cb(el);
    }
    else {
      setTimeout(function () {
        waitForElementToDisplay(selector, time, cb);
      }, time);
    }
  }

  function getUrl(text) {
    var url_regex = /(https?:\/\/)?([w|W]{3}\.)?([a-zA-Z0-9\-\.]{3,}\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})?/;
    var parts     = text.match(url_regex);
    if (!parts) {
      return null;
    }
    if (parts.length) {
      return "https://" + parts[0];
    }
    return null;
  }

  function getDomain(text) {
    if (!text) {
      return null;
    }
    var url_regex = /(https?:\/\/)?([w|W]{3}\.)?([a-zA-Z0-9\-\.]{3,}\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})?/;
    var parts     = text.match(url_regex);
    if (!parts) {
      return null;
    }
    if (parts.length > 3) {
      return parts[3];
    }
    if (parts.length > 0) {
      return parts[0];
    }
    return null;
  }

  function checkDomain(domain) {
    if (!domain) {
      return;
    }
    var next_domain;
    if (config.hiddenSites[domain] || unknown[domain]) {
      return null;
    }
    if (domain in config.sites) {
      return domain;
    }
    next_domain = config.aliases[domain];
    if (config.hiddenSites[next_domain] || unknown[next_domain]) {
      return null;
    }
    if (next_domain in config.sites) {
      return next_domain;
    }
    var elements = domain.split(".");
    next_domain  = elements.pop();
    next_domain  = elements.pop() + "." + next_domain;
    if (config.hiddenSites[next_domain] || unknown[next_domain]) {
      return null;
    }
    if (next_domain in config.sites) {
      return next_domain;
    }
    next_domain = config.aliases[next_domain];
    if (next_domain in config.sites) {
      return next_domain;
    }
    return null;
  }

  function getHiddenDiv(site, count) {
    var hDiv       = document.createElement('div');
    hDiv.className = 'mbfcext ' + config.marker;
    hDiv.id        = "mbfcext-hide-" + count;

    var span_id    = "mbfcspan" + count;
    var icon_id    = "mbfcicon" + count;
    var hide_class = "mbfcelh" + count;
    var hide       = [
      '<div class="mbfc-hide-ctrl' + count + '" style="cursor: pointer"' +
      'onclick="var count = ' + count + ';' +
      'Array.prototype.filter.call(document.getElementsByClassName(\'mbfcelh\'+count),function(e){if(e&&e.style){var t=document.getElementById(\'mbfcspan\'+count),s=document.getElementById(\'mbfcicon\'+count);\'none\'==e.style.display?(e.style.display=\'block\',s.classList.remove(\'fa-eye\'),s.classList.add(\'fa-eye-slash\'),t.textContent=\' Hide\'):(e.style.display=\'none\',s.classList.remove(\'fa-eye-slash\'),s.classList.add(\'fa-eye\'),t.textContent=\' Show\')}});' +
      '">' +
      '<i class="fa fa-eye" id="' + icon_id + '" aria-hidden="true"</i>' +
      '<span id="' + span_id + '"> Show</span>',
      '</div>',
    ];
    hDiv.innerHTML = hide.join("");
    return hDiv;
  }

  function toM(num) {
    if (num > 1000000) {
      return `${Math.round(num/1000000)}M`;
    }
    if (num > 1000) {
      return `${Math.round(num/1000)}K`;
    }
    return num;
  }

  function getReportDiv(site, count, tagsearch) {
    var iDiv  = document.createElement('div');
    iDiv.className = 'mbfcext ' + config.marker;
    iDiv.id        = "mbfcext" + count;

    var mtype        = site.b.toLowerCase().replace(" ", "-");
    var master_style = "mbfc-" + mtype;

    var external_link = `&nbsp;<i class="fa fa-external-link"></i>`;

    var toolbar = `
<tr id="mbfctt${count}" class="mbfc-td-text" style="display:none">
    <td colspan="5">
      <button class="mbfc-right-spacer toolbar-button1-${count}">Ignore ${site.n}</button><span class="spacer">&nbsp;</span>
      <button class="toolbar-button3-${count}">Options</button>
      <button style="float: right;" class="toolbar-button2-${count}">Say Thanks</button>
    </td>
</tr>`;

    var bias_link = `<a target="_blank" href="${site.u}"><span class="mbfc-td-text">${config.biases[site.b].name.replace(/ Bias(ed)?/, "")}${external_link}</span></a>`;
    var drop_down = `
<div class="mbfc-drop-down">
    <i class="fa fa-cog" aria-hidden="true" onclick="el=document.getElementById('mbfctt${count}'); if (el.style.display=='none') { el.style.display='table-row'; } else { el.style.display='none'; }"></i>
</div>    
`;

    var details = [];
    if (site.r > '') {
      details.push(`<a title="Open MediaBiasFactCheck.com for ${site.name}" target="_blank" href="${site.u}">Factually: ${site.r}${external_link}</a>`);
    }
    details.push(`<a title="This takes you to moz.com to define 'Link Equity' that we use to rank sites" href="https://moz.com/learn/seo/what-is-link-equity">References</a>: ${toM(site.L)}`);
    details.push(`<span title="Within MBFC sites, this site has ${site.P}% higher number of external equity links than other sites">Popularity: ${site.P}%</span>`);
    if (tagsearch && site.b !== 'satire') {
      details.push(`<a title="Search factualsearch.news for '${tagsearch}'" target="_blank" href="https://factualsearch.news/#gsc.tab=0&gsc.q=${encodeURIComponent(tagsearch)}">Search ${external_link}</a> `);
    } else {
      details.push(`<a title="Open MediaBiasFactCheck.com for ${site.name}" target="_blank" href="${site.u}">MBFC Details${external_link}</a>`);
    }

    var table, tr;

    switch (site.b) {
      case "satire":
      case "conspiracy":
      case "pro-science":
        tr = ` <td colspan="5" class="mbfc-td mbfc-td-${site.b}">${bias_link}</td> `;
        break;
      default:
        var tdl  = (site.b==="left"         ? bias_link : "&nbsp;"),
            tdlc = (site.b==="left-center"  ? bias_link : "&nbsp;"),
            tdc  = (site.b==="center"       ? bias_link : "&nbsp;"),
            tdrc = (site.b==="right-center" ? bias_link : "&nbsp;"),
            tdr  = (site.b==="right"        ? bias_link : "&nbsp;");

        tr = `
    <td class="mbfc-td mbfc-td-left">${tdl}</td>  
    <td class="mbfc-td mbfc-td-left-center">${tdlc}</td>  
    <td class="mbfc-td mbfc-td-center">${tdc}</td>  
    <td class="mbfc-td mbfc-td-right-center">${tdrc}</td>  
    <td class="mbfc-td mbfc-td-right">${tdr}</td>  
`;
        break;
    }

    details = details.join(", &nbsp;");

    table = `
<div class="">
    <table class="mbfc-table-table" cellpadding="0" border="0">
        <tbody>
          <tr>
              ${tr}      
          </tr>
          <tr>
              <td class="mbfc-td" colspan="5">${drop_down}<span class="mbfc-td-text">${details}</span></td>
          </tr>
          ${toolbar}
      </tbody>
    </table>
</div>    
`;

    iDiv.innerHTML = table;
    return iDiv;
  }

  function addButtons(text, count) {
    waitForElementToDisplay(".toolbar-button1-" + count, 500, function (button) {
      button.addEventListener("click", function () {
        ignoreButton(text, count);
      }, false);
    });
    waitForElementToDisplay(".toolbar-button2-" + count, 500, function (button) {
      button.addEventListener("click", function () {
        thanksButton(count);
      }, false);
    });
    waitForElementToDisplay(".toolbar-button3-" + count, 500, function (button) {
      button.addEventListener("click", function () {
        resetIgnored();
      }, false);
    });
  }

  function hideElement(el, count) {
    if (el && el.parentNode) {
      if (el.classList.value.indexOf('userContent') == -1) {
        el = el.parentNode;
      }
      var hide_class = "mbfcelh" + count;
      el.classList.add('mbfc-el-hidden');
      el.classList.add(hide_class);
      el.style.display = 'none';
    }
  }

  function getEllipses(top_node) {
    var els = top_node.querySelector(config.ellipses_search);
    if (els && els.textContent) {
      return getDomain(els.textContent.toLowerCase());
    }
  }

  function reverseFbPage(fb_page) {
    if (fb_page) {
      var test = fb_page.protocol + "//" + fb_page.host + fb_page.pathname;
      if (config.fb_pages[test]) {
        return config.fb_pages[test].domain;
      }
    }
  }

  function researchSite(parsed_domain, fb_domain) {
    if (parsed_domain && fb_domain) {
      config.sites[parsed_domain].research            = config.sites[parsed_domain].research || {};
      config.sites[parsed_domain].research[fb_domain] = config.sites[parsed_domain].research[fb_domain] || 0;
      if (config.sites[parsed_domain].research[fb_domain]++ > 15) {
        config.sites[fb_domain] = config.sites[parsed_domain];
        reportAssociated(parsed_domain, fb_domain);
      }
      if (config.sites[parsed_domain].research[fb_domain] > 1) {
        log(parsed_domain + ' may be FB url ' + fb_domain + '(count=' + config.sites[parsed_domain].research[fb_domain] + ' now)');
      }
      if (Object.keys(config.sites[parsed_domain].research).length >= 10) {
        var max = 3;
        Object.keys(config.sites[parsed_domain].research).forEach(function (key) {
          if (config.sites[parsed_domain].research[key] == 1) {
            delete config.sites[parsed_domain].research[key];
          }
        })
      }
    }
  }

  function inject(parent, site, user_content, collapsable, tagsearch) {
    reportSite(site);
    if (!collapsable) {
      var iDiv = getReportDiv(site, count, tagsearch);
      parent.appendChild(iDiv);
      addButtons(site.n, count);
    } else {
      reportCollapsed(site);
      user_content.forEach(function(el) {
        hideElement(el, count);
      });
      hideElement(collapsable, count);
      var iDiv = getReportDiv(site, count, tagsearch);
      var hDiv = getHiddenDiv(site, count);
      parent.appendChild(hDiv);
      parent.appendChild(iDiv);
      addButtons(site.n, count);
    }
    count++;
  }

  function process() {
    if (!loaded) {
      return;
    }
    var nodes = document.querySelectorAll(config.data_node_search);
    nodes.forEach(function (top_node) {
      top_node.classList.add(config.marker);

      var report_placement;

      var text          = getEllipses(top_node);
      var domain        = getDomain(text);
      var parsed_domain = checkDomain(text);
      var sites         = [];
      if (parsed_domain) {
        if (config.sites[parsed_domain]) {
          sites.push(config.sites[parsed_domain]);
          report_placement    = top_node.querySelector(config.ellipse_placement);
        } else {
          if (!unknown[domain]) {
            unknown[domain] = true;
            reportUnknown(domain);
          }
        }
      }
      var fb_pages = top_node.querySelectorAll(config.fb_page_search);
      fb_pages.forEach(function (fb_page) {
        var fb_domain = reverseFbPage(fb_page);
        if (fb_domain) {
          if (config.sites[fb_domain]) {
            sites.push(config.sites[fb_domain]);
          } else {
            researchSite(parsed_domain, fb_domain);
          }
        }
      });
      var fb_pages = top_node.querySelectorAll(config.profile_search);
      fb_pages.forEach(function (fb_page) {
        var fb_domain = reverseFbPage(fb_page);
        if (fb_domain) {
          if (config.sites[fb_domain]) {
            sites.push(config.sites[fb_domain]);
          }
        }
      });
      if (sites.length == 0) {
        return;
      }
      var collapse = true;
      sites.forEach(function (s) {
        collapse = collapse && config.collapse[s.b];    // Do we collapse either one?
      });
      var site = sites[0];   // ellipses is highest priority
      if (site.r === 'MIXED' && config.collapse.mixed) {
        collapse = true;
      }
      var user_content = top_node.querySelectorAll('.mtm, .userContent');
      var collapsable = collapse ? top_node.parentNode.querySelector('.commentable_item') : null;
      var tagsearch = top_node.querySelectorAll('.mbs > a');
      if (tagsearch && tagsearch.length > 0) {
        tagsearch = tagsearch[0].text;
      } else {
        tagsearch = null;
      }
      inject(top_node, site, user_content, collapsable, tagsearch);
    });
  }

  var count = 0;

  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      var newNodes = mutation.addedNodes;
      if (newNodes !== null) {
        process();
      }
    });
  });

  function openRequestedPopup() {
    chrome.runtime.sendMessage({method: "startThanks"}, function (response) {
      if (response && response.dirty) {
        loadSettings();
      }
    });
    windowObjectReference = window.open(
      "https://patreon.com/solvedbymike",
      "DescriptiveWindowName",
      "resizable,scrollbars,status"
    );
  }

  function thanksButton() {
    openRequestedPopup();
  }

  function resetIgnored() {
    chrome.runtime.sendMessage({method: "showOptions"}, function (response) {
      if (response && response.dirty) {
        loadSettings();
      }
    });
  }

  function ignoreButton(text, count) {
    config.hiddenSites[text] = true;
    chrome.runtime.sendMessage({method: "hideSite", site: text}, function (response) {
      if (response && response.dirty) {
        loadSettings();
      }
      var el = document.getElementById('mbfcext' + count);
      if (el) {
        el.style.display = 'none';
      }
    });
  }

  function reportUnknown(url) {
    chrome.runtime.sendMessage({method: "unknown", url: url}, function (response) {
      if (response && response.dirty) {
        loadSettings();
      }
    });
  }

  function reportSite(site) {
    chrome.runtime.sendMessage({method: "showSite", site: site.n, bias: site.b}, function (response) {
      if (response && response.dirty) {
        loadSettings();
      }
    });
  }

  function reportCollapsed(site) {
    chrome.runtime.sendMessage({method: "collapsedSite", site: site.n, bias: site.b}, function (response) {
      if (response && response.dirty) {
        loadSettings();
      }
    });
  }

  function reportAssociated(parsed_domain, fb_domain) {
    chrome.runtime.sendMessage({method: "associatedSite", site: parsed_domain, fb_url: fb_domain}, function (response) {
      if (response && response.dirty) {
        loadSettings();
      }
    });
  }

  observer.observe(document, {
    childList:     true,
    subtree:       true,
    attributes:    false,
    characterData: false,
  });

  loadSettings();


})();
