var hiddenSites = {};
var logged      = {};
var sites       = {};
var biases      = {};
var aliases     = {};
var loaded      = false;
var verbose     = false;
var windowObjectReference;
var load_count  = 3;

var base = "https://drmikecrowe.github.io/mbfcext/";

(function () {

    function isDevMode() {
        var obj = chrome.runtime.getManifest();
        return !('update_url' in obj);
    }

    verbose = isDevMode();

    var getFile = function (type) {
        var xhr                = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                var date = new Date();
                date.setDate(date.getDate() + 1);
                var obj        = {}
                obj[type]      = JSON.parse(xhr.responseText);
                obj['expires2'] = date.getTime();
                chrome.storage.local.set(obj);
                switch (type) {
                    case 'sources':
                        sites = obj[type];
                        save_mbfc();
                        load_count--;
                        loaded = (load_count == 0);
                        if (loaded) process();
                        break;
                    case 'biases':
                        biases = obj[type];
                        load_count--;
                        loaded = (load_count == 0);
                        if (loaded) process();
                        break;
                    case 'aliases':
                        aliases = obj[type];
                        load_count--;
                        loaded = (load_count == 0);
                        if (loaded) process();
                        break;
                }
            }
        };
        var url;
        switch (type) {
            case 'sources':
            case 'biases':
            case 'aliases':
                url = base + type + '.json';
                break;
        }
        xhr.open('GET', url, true);
        xhr.send();
    };

    var getSources = function () {
        getFile('sources');
    };

    var getBiases = function () {
        getFile('biases');
    };

    var getAliases = function () {
        getFile('aliases');
    };

    var update = function () {
        load_count = 3;
        if (verbose) {
            console.log("Updating sources");
        }
        getSources();
        getBiases();
        getAliases();
    };

    function save_mbfc() {
        sites["mediabiasfactcheck.com"] = {
            "id":       "-1",
            "name":     "Media Bias Fact Check",
            "homepage": "https://mediabiasfactcheck.com/",
            "url":      "https://mediabiasfactcheck.com/",
            "bias":     "center"
        };
    }

    chrome.storage.local.get(['biases', 'sources', 'expires2'], function (items) {
        loaded = false;
        load_count = 0;
        if (items.sources === undefined || items.biases === undefined) {
            update();
        } else {
            var now    = new Date();
            var future = new Date();
            future.setDate(future.getHours() + 12);
            var stored_time = items.expires2 || 0;
            if (stored_time < now.getTime() || stored_time > future.getTime()) {
                update();
            } else {
                if (items.sources && Object.keys(items.sources).length > 0) {
                    sites = items.sources;
                    loaded = true;
                    save_mbfc();
                } else {
                    getFile('sources');
                    loaded = false;
                    load_count++;
                }
                if (items.biases && Object.keys(items.biases).length > 0) {
                    biases = items.biases;
                } else {
                    getFile('biases');
                    loaded = false;
                    load_count++;
                }
                if (items.aliases && Object.keys(items.aliases).length > 0) {
                    aliases = items.aliases;
                } else {
                    getFile('aliases');
                    loaded = false;
                    load_count++;
                }
            }
        }
    });

    function loadHidden() {
        chrome.runtime.sendMessage({method: "getLocalStorage", key: "hidden"}, function (response, b, c) {
            var hidden = response && response.data ? response.data : {};
            if (hidden) {
                hiddenSites = hidden;
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
        if (hiddenSites[domain] || logged[domain]) {
            return null;
        }
        if (domain in sites) {
            return domain;
        }
        next_domain = aliases[domain];
        if (next_domain in sites) {
            return next_domain;
        }
        var elements = domain.split(".");
        next_domain  = elements.pop();
        next_domain  = elements.pop() + "." + next_domain;
        if (hiddenSites[next_domain] || logged[next_domain]) {
            return null;
        }
        if (next_domain in sites) {
            return next_domain;
        }
        next_domain = aliases[next_domain];
        if (next_domain in sites) {
            return next_domain;
        }
        return null;
    }

    function searchNodes(text, top_node) {
        var site    = sites[text];
        if (top_node.classList.contains('mbfcfound')) {
            return;
        }
        top_node.classList.add('mbfcfound');
        var nodes   = top_node.querySelectorAll("div.mtm, div.mbs");
        if (nodes.length == 0) {
            nodes = top_node.querySelectorAll("div.lfloat");
        }
        if (nodes.length) {
            inject(nodes[0], site);
            return true;
        }
        return false;
    }

    function inject(parent, site) {

        var iDiv  = document.createElement('div');
        var found = false;
        count++;
        iDiv.className = 'mbfcext';
        iDiv.id        = "mbfcext" + count;

        var mtype        = site.bias.toLowerCase().replace(" ", "-");
        var master_style = "mbfc-" + mtype;

        var toolbar = [
            '<div id="mbfctt' + count + '" class="" style="display:none">',
            '<button class="myButton2 mbfc-right-spacer toolbar-button1-' + count + '">Ignore ' + site.name + '</button><span class="spacer">&nbsp;</span>',
            '<button class="myButton2 toolbar-button3-' + count + '">Options</button>',
            '<button style="float: right;" class="myButton2 toolbar-button2-' + count + '">Say Thanks</button>',
            '</div>'
        ];
        var table   = [
            '<div class="mbfc-config content-option' + count + ' toolbar-home ">',
            '<i class="fa fa-cog" aria-hidden="true" onclick="el=document.getElementById(\'mbfctt' + count + '\'); if (el.style.display==\'none\') { el.style.display=\'block\'; } else { el.style.display=\'none\'; }"></i>',
            '</div>',
            '<div class="mbfc-table">' +
            '<div class="mbfc-element ' + master_style + ' mbfc-table-' + mtype + '">' +
            '<a target="_blank" href="' + site.url + '">' + biases[site.bias].name.replace(/ Bias(ed)?/, "") + '</a>' +
            '</div>' +
            '</div>' +
            '<div class="mbfc-url">' +
            '<a class="mbfcicon" target="_blank" href="' + site.url + '">' +
            '<img width="20" height="20" title="" alt="" src="data:image/png;base64,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" />' +
            '</a>' +
            '</div>' +
            '<div class="clearfix">' +
            '<a class="mbfcicon" target="_blank" href="' + site.url + '">mediabiasfactcheck.com</a>' +
            '</div>'
        ];

        chrome.runtime.sendMessage({method: "showSite", site: site.name, bias: site.bias});
        iDiv.innerHTML = table.join("") + toolbar.join("");
        parent.appendChild(iDiv);
        (function (text, count) {
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
        })(site.name, count);
    }

    function process() {
        if (!loaded) return;
        var nodes = document.querySelectorAll("div._5jmm[data-fte='1']:not(.mbfcfound)");
        for (var ii = 0, nn = nodes.length; ii < nn; ii++) {
            var top_node = nodes[ii] ? nodes[ii] : null;
            var els = top_node ? top_node.querySelectorAll('.ellipsis') : [];
            var node = els.length ? els[0] : null;
            if (!node) {
                continue;
            }
            var domain        = getDomain(node.textContent.toLowerCase());
            var parsed_domain = checkDomain(domain);
            if (parsed_domain) {
                searchNodes(parsed_domain, top_node);
            } else {
                if (!logged[domain]) {
                    logged[domain] = true;
                    reportUnknown(domain);
                }
            }
        }
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
        chrome.runtime.sendMessage({method: "startThanks"});
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
        });
    }

    function ignoreButton(text, count) {
        hiddenSites[text] = true;
        chrome.runtime.sendMessage({method: "hideSite", site: text}, function (response) {
            var el = document.getElementById('mbfcext' + count);
            if (el) {
                el.style.display = 'none';
            }
        });
    }

    function reportUnknown(url) {
        chrome.runtime.sendMessage({method: "unknown", url: url}, function (response) {
        });
    }

    observer.observe(document, {
        childList:     true,
        subtree:       true,
        attributes:    false,
        characterData: false,
    });

    loadHidden();

})();
