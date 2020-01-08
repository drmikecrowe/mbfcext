import debug from "debug";
import { isDevMode } from "../utils/utils";
import { HandlerCallbackType, IEmptyMessageRequest } from ".";
import { IConfig } from "../utils/definitions";

isDevMode();
const log = debug("mbfc:GetConfigMessage");

const GetConfigMessageMethod = "GetConfig";

export class GetConfigMessage {
    static tabId: number = null;

    constructor(fn: HandlerCallbackType) {
        chrome.runtime.onMessage.addListener(async (request: IEmptyMessageRequest, sender, sendResponse) => {
            if (request.method === GetConfigMessageMethod) {
                log(`Received ${GetConfigMessageMethod}Message`);
                const result: any = await fn(request);
                sendResponse(result);
            }
        });
    }

    static async SendMessage(): Promise<IConfig> {
        try {
            log(`Requesting updated configuration`);
            const params: IEmptyMessageRequest = {
                method: GetConfigMessageMethod,
            };
            return new Promise(resolve => chrome.runtime.sendMessage(params, resolve));
        } catch (err) {
            console.log(err);
        }
    }
}
