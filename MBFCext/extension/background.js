'use strict';

var hidden  = {};
var verbose = !('update_url' in chrome.runtime.getManifest());
var loaded  = false;
var allowed = false;
var config  = {};
var tabs    = null;
var dirty   = true;

var base = "https://drmikecrowe.github.io/mbfcext/";

function ChromePromise() {
  /*!
   * chrome-promise 2.0.3
   * https://github.com/tfoxy/chrome-promise
   *
   * Copyright 2015 Tomás Fox
   * Released under the MIT license
   */

  var slice          = Array.prototype.slice,
      hasOwnProperty = Object.prototype.hasOwnProperty;
  var runtime        = chrome.runtime;

  fillProperties(chrome, this);

  ////////////////

  function setPromiseFunction(fn, thisArg) {

    return function () {
      var args = slice.call(arguments);

      return new Promise(function (resolve, reject) {
        args.push(callback);

        fn.apply(thisArg, args);

        function callback() {
          var err     = runtime.lastError;
          var results = slice.call(arguments);
          if (err) {
            reject(err);
          } else {
            switch (results.length) {
              case 0:
                resolve();
                break;
              case 1:
                resolve(results[0]);
                break;
              default:
                resolve(results);
            }
          }
        }
      });

    };

  }

  function fillProperties(source, target) {
    for (var key in source) {
      if (hasOwnProperty.call(source, key)) {
        var val  = source[key];
        var type = typeof val;

        if (type === 'object' && !(val instanceof ChromePromise)) {
          target[key] = {};
          fillProperties(val, target[key]);
        } else if (type === 'function') {
          target[key] = setPromiseFunction(val, source);
        } else {
          target[key] = val;
        }
      }
    }
  }
}

const chromep = new ChromePromise({chrome: chrome});

function log() {
  if (!verbose) {
    return;
  }
  console.log(Array.prototype.slice.call(arguments));
}

function getFile(type) {
  return new Promise(function (resolve, reject) {
    var xhr                = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
        var js   = JSON.parse(xhr.responseText);
        var date = new Date();
        date.setDate(date.getDate() + 1);
        var obj         = {}
        obj[type]       = js;
        obj['expires2'] = date.getTime();
        log(type + ' ' + Object.keys(js).length + ' items retrieved from server, saving to local storage with expires of ', date);
        chromep.storage.local.set(obj)
          .then(function () {
            return resolve(js)
          });
      }
    };
    var fname = base + type + '.json';
    if (verbose) {
      fname = chrome.extension.getURL('/' + type + '.json')
    }
    xhr.open('GET', fname, true);
    xhr.send();
  });
}

function getStorage(type) {
  return chromep.storage.local.get(type)
    .then(function (dict) {
      if (typeof dict == 'object') {
        log(type + ' config: ' + Object.keys(dict).length + ' items retrieved from storage');
        if (!type) {
          return dict     // getting all settings
        }
        return dict[type];
      }
      return dict;
    });
}

function getStorageOrFile(type) {
  if (verbose) return getFile(type);
  return chromep.storage.local.get(type)
    .then(function (dict) {
      if (dict) {
        if (dict[type]) {
          var now    = new Date();
          var future = new Date();
          future.setDate(future.getHours() + 12);
          var stored_time = dict.expires2 || 0;
          if (stored_time >= now.getTime() && stored_time <= future.getTime()) {
            log('Using ' + type + ' from local storage');
            return dict[type];
          } else {
            log(type + ' is old, getting new one');
          }
        }
      }
      log(type + ' not in local storage, requesting up-to-date version')
      return getFile(type);
    });
}

function save_mbfc() {
  config.sites["mediabiasfactcheck.com"] = {
    "id":       "-1",
    "name":     "Media Bias Fact Check",
    "homepage": "https://mediabiasfactcheck.com/",
    "url":      "https://mediabiasfactcheck.com/",
    "bias":     "center"
  };
}

function report(a, b, c, d, e) {
  log('REPORTING: ', a, b, c, d, e);
  if (allowed) {
    if (verbose) {
      log('Skipping reporting in dev mode');
      return;
    }
    if (window.ga) {
      ga(a, b, c, d, e);
    } else {
      log('NO ga LOADED');
    }
  } else {
    log('REPORTING not allowed');
  }
}

function addGoogleAnalytics() {
  if (!window.ga) {
    (function () {
      window.ga = function () {
        (window.ga.q = window.ga.q || []).push(arguments);
      }, window.ga.l = 1 * new Date();
      var tag = 'script';
      var a   = document.createElement(tag);
      var m   = document.getElementsByTagName(tag)[0];
      a.async = 1;
      a.src   = 'https://www.google-analytics.com/analytics.js';
      m.parentNode.insertBefore(a, m);
    })();
    ga('create', 'UA-83027155-1', 'auto');
    ga('set', 'checkProtocolTask', null);
  }
}

function setupGoogleAnalytics(dict) {
  if (loaded) {
    return Promise.resolve();
  }
  loaded = true;
  if (!dict['privacy_settings.mbfcanalytics_disabled']) {
    log('Loading analytics');
    allowed = true;
    if (!verbose) {
      addGoogleAnalytics();
    }
  } else {
    log('Analytics disabled');
  }
}

function loadSettings() {
  var todo = [
    getStorageOrFile('sources'),
    getStorageOrFile('biases'),
    getStorageOrFile('aliases'),
    getStorage('mbfchidden'),
    chromep.storage.sync.get(),
    getStorageOrFile('config'),
  ];
  log('Loading settings');
  return Promise.all(todo)
    .then(function (parts) {
      log('Settings retrieved, processing');
      config = {
        sites:       parts[0],
        biases:      parts[1],
        aliases:     parts[2],
        hiddenSites: parts[3] || {},
        collapse:    {},
        fb_pages:    {},
      };
      Object.keys(parts[4]).forEach(function(key) {
        config[key] = parts[4][key];
      });
      Object.keys(config.sites).forEach(function(key) {
        var fb = config.sites[key].facebook_url;
        if (fb) {
          if (!fb.endsWith('/')) {
            fb += '/';
          }
          config.fb_pages[fb] = config.sites[key];
        }
      });
      save_mbfc();
      setupGoogleAnalytics(parts[4])
      setCollapsed(parts[4]);
      return config;
    })
    .catch(function (err) {
      log('ERROR: ', err);
    })
}

/*
 collapse.collapse-conspiracy
 collapse.collapse-fake-news
 collapse.collapse-left
 collapse.collapse-pro-science
 collapse.collapse-right
 privacy_settings.mbfcanalytics_disabled
 */
function setCollapsed(dict) {
  Object.keys(dict).forEach(function (key) {
    if (key.startsWith("collapse.")) {
      config.collapse[key.substring(18)] = (dict[key] == "hide");
      log('Collapsing ' + key.substring(18));
    }
  });
}

function loadCollapsedOnly() {
  return chromep.storage.sync.get()
    .then(function(dict) {
      setCollapsed(dict);
    });
}

function resetIgnored() {
  log('Resetting ignored');
  report('send', 'event', 'reset', 'shown');
  config.hiddenSites = {};
  return chromep.storage.local.set({mbfchidden: config.hiddenSites})
    .then(function () {
      return chromep.storage.sync.set({'ignored_sites.reset_ignored': false})
    });
}

chrome.storage.onChanged.addListener(function (changes) {
  dirty = true;
  log('CHANGES: ', changes);
  if (changes['ignored_sites.reset_ignored'] && changes['ignored_sites.reset_ignored'].newValue) {
    resetIgnored();
  }
  loadCollapsedOnly();
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.method == "setup") {
    log('Sending configuration');
    sendResponse({data: config});
    dirty = false;
  } else if (request.method == "resetIgnored") {
    resetIgnored()
      .then(function() {
        sendResponse({data: config.hiddenSites, dirty: dirty});
      });
  } else if (request.method == "showOptions") {
    log('Showing options');
    chrome.runtime.openOptionsPage(function (param) {
      log('PARAM: ', param);
    })
  } else if (request.method == "startThanks") {
    //TODO: New options page
    report('send', 'event', 'thanks', 'shown');
    sendResponse({dirty: dirty});
  } else if (request.method == "unknown") {
    report('send', 'event', 'unknown', request.url);
    sendResponse({dirty: dirty});
  } else if (request.method == "associatedSite") {
    report('send', 'event', 'associatedSite', request.site, request.fb_url);
    sendResponse({dirty: dirty});
  } else if (request.method == "showSite") {
    report('send', 'event', 'site', 'shown', request.site);
    report('send', 'event', 'bias', 'shown', request.bias);
    sendResponse({dirty: dirty});
  } else if (request.method == "collapsedSite") {
    report('send', 'event', 'site', 'collapsed', request.site);
    report('send', 'event', 'bias', 'collapsed', request.bias);
    sendResponse({dirty: dirty});
  } else if (request.method == "hideSite") {
    report('send', 'event', 'hidden', 'site', request.site);
    config.hiddenSites[request.site] = true;
    chromep.storage.local.set({mbfchidden: config.hiddenSites, dirty: dirty})
      .then(function () {
        log('Resetting hidden to: ', config.hiddenSites);
        sendResponse({data: config.hiddenSites, dirty: dirty});
      });
  } else {
  } // snub them.
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status == 'complete') {
    chrome.tabs.query({active: true, currentWindow: true}, function(t){
      tabs = t;
    });
  }
});

// Open options on installed.
chrome.runtime.onInstalled.addListener(function () {
  getStorage('firstrun')
    .then(function (firstrun) {
      if (firstrun != 'done') {
        chromep.storage.local.set({firstrun: 'done'})
          .then(function () {
            chrome.runtime.openOptionsPage();
          });
      }
    });
});

loadSettings();
