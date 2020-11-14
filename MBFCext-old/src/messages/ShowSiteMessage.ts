import debug from "debug";
import { isDevMode } from "../utils/utils";
import { HandlerCallbackType, IShowSiteRequest } from ".";
import { ISource } from "../utils/definitions";

isDevMode();
const log = debug("mbfc:ShowSiteMessage");

const ShowSiteMessageMethod = "ShowSite";

export class ShowSiteMessage {
    constructor(fn: HandlerCallbackType) {
        chrome.runtime.onMessage.addListener(async (request: IShowSiteRequest, sender, sendResponse) => {
            if (request.method === ShowSiteMessageMethod) {
                log(`Received ${ShowSiteMessageMethod}Message`);
                const result: any = await fn(request);
                sendResponse(result);
            }
        });
    }

    static async SendMessage(source: ISource, isAlias: boolean, isBase: boolean, isCollapsed: boolean): Promise<void> {
        try {
            log(`Sending ShowSiteMessageMethod`);
            const params: IShowSiteRequest = {
                method: ShowSiteMessageMethod,
                source,
                isAlias,
                isBase,
                isCollapsed,
            };
            return new Promise(resolve => chrome.runtime.sendMessage(params, resolve));
        } catch (err) {
            console.log(err);
        }
    }
}
