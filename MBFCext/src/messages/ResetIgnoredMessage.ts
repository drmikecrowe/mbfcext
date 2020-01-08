import debug from "debug";
import { isDevMode } from "../utils/utils";
import { HandlerCallbackType, IEmptyMessageRequest } from ".";

isDevMode();
const log = debug("mbfc:ResetIgnoredMessage");

const ResetIgnoredMessageMethod = "ResetIgnored";

export class ResetIgnoredMessage {
    constructor(fn: HandlerCallbackType) {
        chrome.runtime.onMessage.addListener(async (request: IEmptyMessageRequest, sender, sendResponse) => {
            if (request.method === ResetIgnoredMessageMethod) {
                log(`Received ${ResetIgnoredMessageMethod}Message`);
                const result: any = await fn(request);
                sendResponse(result);
            }
        });
    }

    static async SendMessage(): Promise<void> {
        try {
            log(`Sending $1`);
            const params: IEmptyMessageRequest = {
                method: ResetIgnoredMessageMethod,
            };
            return new Promise(resolve => chrome.runtime.sendMessage(params, resolve));
        } catch (err) {
            console.log(err);
        }
    }
}
