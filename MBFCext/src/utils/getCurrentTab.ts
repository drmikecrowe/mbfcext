export async function getCurrentTab(): Promise<chrome.tabs.Tab> {
    return new Promise(resolve => {
        // Query filter to be passed to chrome.tabs.query - see
        // https://developer.chrome.com/extensions/tabs#method-query
        var queryInfo = {
            active: true,
            currentWindow: true,
        };

        chrome.tabs.query(queryInfo, function(tabs) {
            // exactly one tab.
            var tab = tabs[0];
            resolve(tab);
        });
    });
}