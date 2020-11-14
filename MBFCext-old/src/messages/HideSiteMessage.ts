import debug from "debug";
import { isDevMode } from "../utils/utils";
import { HandlerCallbackType, IHideSiteRequest } from ".";
import { ISource } from "../utils/definitions";

isDevMode();
const log = debug("mbfc:HideSiteMessage");

const HideSiteMessageMethod = "HideSite";

export class HideSiteMessage {
    constructor(fn: HandlerCallbackType) {
        chrome.runtime.onMessage.addListener(async (request: IHideSiteRequest, sender, sendResponse) => {
            if (request.method === HideSiteMessageMethod) {
                log(`Received ${HideSiteMessageMethod}Message`);
                const result: any = await fn(request);
                sendResponse(result);
            }
        });
    }

    static async SendMessage(source: ISource, hideState: boolean): Promise<boolean> {
        try {
            log(`Sending HideSiteMessage`);
            if (!source) {
                console.error(`ERROR/${HideSiteMessageMethod}: no source`);
                return;
            }
            const params: IHideSiteRequest = {
                method: HideSiteMessageMethod,
                source,
                hideState,
            };
            return new Promise(resolve => chrome.runtime.sendMessage(params, resolve));
        } catch (err) {
            console.log(err);
        }
    }
}
