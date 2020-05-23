import { get } from "lodash-es";
import { BrowserMessage, HandleMessageCallback } from ".";

const HideSiteMessageMethod = "HideSiteMessage";

export class HideSiteMessage {
    public method = HideSiteMessageMethod;
    public domain: string;

    static check(request: BrowserMessage, fn: HandleMessageCallback): void {
        if (get(request, "method") === HideSiteMessageMethod) {
            return fn(request);
        }
    }

    constructor(domain: string) {
        this.method = HideSiteMessageMethod;
        this.domain = domain;
    }
}
