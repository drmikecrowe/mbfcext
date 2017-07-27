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

  function getReportDiv(site, count) {
    var iDiv  = document.createElement('div');
    iDiv.className = 'mbfcext ' + config.marker;
    iDiv.id        = "mbfcext" + count;

    var mtype        = site.b.toLowerCase().replace(" ", "-");
    var master_style = "mbfc-" + mtype;

    var toolbar = [
      '<div id="mbfctt' + count + '" class="" style="display:none">',
      '<button class="myButton2 mbfc-right-spacer toolbar-button1-' + count + '">Ignore ' + site.n + '</button><span class="spacer">&nbsp;</span>',
      '<button class="myButton2 toolbar-button3-' + count + '">Options</button>',
      '<button style="float: right;" class="myButton2 toolbar-button2-' + count + '">Say Thanks</button>',
      '</div>'
    ];
    var factual = site.r && site.r > "" ? (" -- factual reporting: " + site.r) : "";
    var table   = [
      '<div class="mbfc-config content-option' + count + ' toolbar-home ">',
      '<i class="fa fa-cog" aria-hidden="true" onclick="el=document.getElementById(\'mbfctt' + count + '\'); if (el.style.display==\'none\') { el.style.display=\'block\'; } else { el.style.display=\'none\'; }"></i>',
      '</div>',
      '<div class="mbfc-table">' +
      '<div class="mbfc-element ' + master_style + ' mbfc-table-' + mtype + '">' +
      '<a target="_blank" href="' + site.u + '">' + config.biases[site.b].name.replace(/ Bias(ed)?/, "") + '</a>' +
      '</div>' +
      '</div>' +
      '<div class="mbfc-url">' +
      '<a class="mbfcicon" target="_blank" href="' + site.u + '">' +
      '<img width="20" height="20" title="" alt="" src="data:image/png;base64,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" />' +
      '</a>' +
      '</div>' +
      '<div class="clearfix">' +
      '<a class="mbfcicon" target="_blank" href="' + site.u + '">mediabiasfactcheck.com ' + factual + '</a>' +
      '</div>'
    ];
    iDiv.innerHTML = table.join("") + toolbar.join("");
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

  function inject(parent, site, user_content, collapsable) {
    reportSite(site);
    if (!collapsable) {
      var iDiv = getReportDiv(site, count);
      parent.appendChild(iDiv);
      addButtons(site.n, count);
    } else {
      reportCollapsed(site);
      user_content.forEach(function(el) {
        hideElement(el, count);
      });
      hideElement(collapsable, count);
      var iDiv = getReportDiv(site, count);
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
        collapse = collapse && config.collapse[s.bias];    // Do we collapse either one?
      });
      var site = sites[0];   // ellipses is highest priority
      var user_content = top_node.querySelectorAll('.mtm, .userContent');
      var collapsable = collapse ? top_node.parentNode.querySelector('.commentable_item') : null;
      inject(top_node, site, user_content, collapsable);
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
