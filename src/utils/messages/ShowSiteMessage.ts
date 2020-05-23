import { get } from "lodash-es";
import { ISource } from "../definitions";
import { BrowserMessage, HandleMessageCallback } from ".";

const ShowSiteMessageMethod = "ShowSite";

export class ShowSiteMessage {
    public method = ShowSiteMessageMethod;
    public source: ISource;
    public isAlias: boolean;
    public isBase: boolean;
    public isCollapsed: boolean;

    static check(request: BrowserMessage, fn: HandleMessageCallback): void {
        if (get(request, "method") === ShowSiteMessageMethod) {
            return fn(request);
        }
    }

    constructor(
        source: ISource,
        isAlias: boolean,
        isBase: boolean,
        isCollapsed: boolean
    ) {
        this.method = ShowSiteMessageMethod;
        this.source = source;
        this.isAlias = isAlias;
        this.isBase = isBase;
        this.isCollapsed = isCollapsed;
    }
}
