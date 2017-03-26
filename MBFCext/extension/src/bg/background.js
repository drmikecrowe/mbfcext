var hidden  = {};
var verbose = isDevMode();
var loaded  = false;
var allowed = false;

function isDevMode() {
    return !('update_url' in chrome.runtime.getManifest());
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

function report(a, b, c, d, e) {
    if (allowed) {
        if (window.ga) {
            if (verbose) console.log('REPORTING: ', a, b, c, d, e);
            ga(a, b, c, d, e);
        } else {
            if (verbose) console.error('NO ga LOADED');
        }
    } else {
        if (verbose) console.log('REPORTING not allowed');
    }
}

function setupGoogleAnalytics() {
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

function loadAnalytics() {
    if (loaded) return;
    loaded  = true;
    allowed = true;
    setupGoogleAnalytics();
}

function checkOptions() {
    if (loaded) return;
    chrome.storage.sync.get("mbfcanalytics", function (allow) {
        if (typeof allow.mbfcanalytics == 'undefined' || typeof allow.mbfcanalytics.enabled == 'undefined') {
            if (verbose) console.log('ALLOW: ', allow);
            loadAnalytics();
        } else {
            if (verbose) console.log('ALLOW: ', allow);
            if (allow.mbfcanalytics.enabled) {
                loadAnalytics();
            } else {
                loaded = true;
            }
        }
    });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (verbose) console.log('Processing: ', request.method);
    if (request.method == "getLocalStorage") {
        checkOptions();
        chrome.storage.sync.get("mbfchidden", function (dict) {
            hidden = dict && dict.mbfchidden ? dict.mbfchidden : {};
            //if (verbose) console.log('Dictionary: ', hidden);
            sendResponse({data: hidden});
        });
        return true;
    } else if (request.method == "resetIgnored") {
        if (verbose) console.log('Resetting ignored');
        report('send', 'event', 'reset', 'shown');
        chrome.storage.sync.clear(function (dict) {
            hidden = {};
            if (verbose) console.log('Dictionary: ', hidden);
            sendResponse({data: hidden});
        });
    } else if (request.method == "showOptions") {
        chrome.runtime.openOptionsPage(function (param) {
            if (verbose) console.log('PARAM: ', param);
        })
    } else if (request.method == "startThanks") {
        if (verbose) console.log('Showing thanks');
        report('send', 'event', 'thanks', 'shown');
    } else if (request.method == "unknown") {
        if (verbose) console.log('unknown', request.url);
        report('send', 'event', 'unknown', request.url);
    } else if (request.method == "showSite") {
        if (verbose) console.log('Showing site ', request);
        report('send', 'event', 'site', 'shown', request.site);
        report('send', 'event', 'bias', 'shown', request.bias);
    } else if (request.method == "hideSite") {
        report('send', 'event', 'hidden', 'site', request.site);
        hidden[request.site] = true;
        chrome.storage.sync.set({"mbfchidden": hidden}, function (dict) {
            if (verbose) console.log('Set hidden: ', hidden);
        });
    } else {
    } // snub them.
});

