import { Facebook } from "./content/facebook";
import debug from "debug";
import { isDevMode } from "./utils";

const devMode = isDevMode();
const log = debug("mbfc:inject-facebook");

class InjectFacebook {
    private static instance: InjectFacebook;
    static fb: Facebook;

    static getInstance() {
        if (!InjectFacebook.instance) {
            InjectFacebook.instance = new InjectFacebook();
            debug(`Starting Facebook`);
            InjectFacebook.fb = new Facebook();
        }
        return InjectFacebook.instance;
    }
}

const ifb = InjectFacebook.getInstance();

log(`MutationObserver started`);
const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        var newNodes = mutation.addedNodes;
        if (newNodes !== null) {
            InjectFacebook.fb.process();
        }
    });
});

observer.observe(document, {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false,
});
