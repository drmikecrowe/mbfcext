import { get } from "lodash-es";
import { ISource } from "../definitions";
import { BrowserMessage, HandleMessageCallback } from ".";

const AssociateSiteMessageMethod = "AssociateSiteMessage";

export class AssociateSiteMessage {
    public;
    public source: ISource;
    public fb_url: string;

    static check(request: BrowserMessage, fn: HandleMessageCallback): void {
        if (get(request, "method") === AssociateSiteMessageMethod) {
            return fn(request);
        }
    }

    constructor(source: ISource, fb_url: string) {
        this.source = source;
        this.fb_url = fb_url;
    }
}
