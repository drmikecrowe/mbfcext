import { Twitter } from "./content/twitter";
import debug from "debug";
import { isDevMode } from "./utils";

/**
 * ,
        {
            "matches": ["*://twitter.com/*", "*://*.twitter.com/*"],
            "run_at": "document_start",
            "js": ["twitter.bundle.js"],
            "css": ["css/font-awesome-4.6.3/css/font-awesome.min.css", "css/twitter.css"]
        }
 */

const devMode = isDevMode();
const log = debug("mbfc:inject-twitter");

class InjectTwitter {
    private static instance: InjectTwitter;
    static fb: Twitter;

    static getInstance() {
        if (!InjectTwitter.instance) {
            InjectTwitter.instance = new InjectTwitter();
            debug(`Starting Twitter`);
            InjectTwitter.fb = new Twitter();
        }
        return InjectTwitter.instance;
    }
}

const ifb = InjectTwitter.getInstance();

log(`MutationObserver started`);
const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        var newNodes = mutation.addedNodes;
        if (newNodes !== null) {
            InjectTwitter.fb.process();
        }
    });
});

observer.observe(document, {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false,
});
