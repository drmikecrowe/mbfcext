export {}
const log = require('debug')('mbfc:utils:getDomain');

export const getDomain = (url: string) => {
    let hn, p;
    try {
        if (!url.startsWith("http")) url = "https://" + url;
        hn = new URL(url).hostname;
        if (hn) hn = hn.match(/(www[0-9]?\.)?(.+)/i)[2];
        p = new URL(url).pathname;
    } catch (e) {
        // Invalid URL
    }
    return { domain: hn, path: p };
};
