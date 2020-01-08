import debug from "debug";
import { isDevMode } from "../utils/utils";
import { HandlerCallbackType, IEmptyMessageRequest } from ".";

isDevMode();
const log = debug("mbfc:ShowOptionsMessage");

const ShowOptionsMessageMethod = "ShowOptions";

export class ShowOptionsMessage {
    constructor(fn: HandlerCallbackType) {
        chrome.runtime.onMessage.addListener(async (request: IEmptyMessageRequest, sender, sendResponse) => {
            if (request.method === ShowOptionsMessageMethod) {
                log(`Received ${ShowOptionsMessageMethod}Message`);
                const result: any = await fn(request);
                sendResponse(result);
            }
        });
    }

    static async SendMessage(): Promise<void> {
        try {
            log(`Sending $1`);
            const params: IEmptyMessageRequest = {
                method: ShowOptionsMessageMethod,
            };
            return new Promise(resolve => chrome.runtime.sendMessage(params, resolve));
        } catch (err) {
            console.log(err);
        }
    }
}
