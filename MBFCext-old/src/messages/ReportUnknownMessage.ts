import debug from "debug";
import { isDevMode } from "../utils/utils";
import { HandlerCallbackType, IReportUnknownRequest } from ".";

isDevMode();
const log = debug("mbfc:ReportUnknownMessage");

const ReportUnknownMessageMethod = "ReportUnknown";

export class ReportUnknownMessage {
    constructor(fn: HandlerCallbackType) {
        chrome.runtime.onMessage.addListener(async (request: IReportUnknownRequest, sender, sendResponse) => {
            if (request.method === ReportUnknownMessageMethod) {
                log(`Received ${ReportUnknownMessageMethod}Message`);
                const result: any = await fn(request);
                sendResponse(result);
            }
        });
    }

    static async SendMessage(domain: string): Promise<void> {
        try {
            log(`Sending $1`);
            const params: IReportUnknownRequest = {
                method: ReportUnknownMessageMethod,
                domain,
            };
            return new Promise(resolve => chrome.runtime.sendMessage(params, resolve));
        } catch (err) {
            console.log(err);
        }
    }
}
