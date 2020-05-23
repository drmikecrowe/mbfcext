import { get } from "lodash-es";
import { BrowserMessage, HandleMessageCallback } from ".";

const ReportUnknownMessageMethod = "ReportUnknownMessage";

export class ReportUnknownMessage {
    public method = ReportUnknownMessageMethod;
    public domain: string;

    static check(request: BrowserMessage, fn: HandleMessageCallback): void {
        if (get(request, "method") === ReportUnknownMessageMethod) {
            return fn(request);
        }
    }

    constructor(domain: string) {
        this.method = ReportUnknownMessageMethod;
        this.domain = domain;
    }
}
