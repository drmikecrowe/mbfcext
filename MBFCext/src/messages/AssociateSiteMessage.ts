import debug from "debug";
import { isDevMode } from "../utils/utils";
import { HandlerCallbackType, IAssociateSiteRequest } from ".";
import { ISource } from "../utils/definitions";

isDevMode();
const log = debug("mbfc:AssociateSiteMessage");

const AssociateSiteMessageMethod = "AssociateSite";

export class AssociateSiteMessage {
    constructor(fn: HandlerCallbackType) {
        chrome.runtime.onMessage.addListener(async (request: IAssociateSiteRequest, sender, sendResponse) => {
            if (request.method === AssociateSiteMessageMethod) {
                log(`Received ${AssociateSiteMessageMethod}Message`);
                const result: any = await fn(request);
                sendResponse(result);
            }
        });
    }

    static async SendMessage(site: ISource, fb_url): Promise<void> {
        try {
            log(`Requesting updated configuration`);
            if (!site) {
                console.error(`ERROR/${AssociateSiteMessageMethod}: no site`);
                return;
            }
            const params: IAssociateSiteRequest = {
                method: AssociateSiteMessageMethod,
                source: site,
                fb_url,
            };
            return new Promise(resolve => chrome.runtime.sendMessage(params, resolve));
        } catch (err) {
            console.log(err);
        }
    }
}
