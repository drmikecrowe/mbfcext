import { get } from "lodash-es";
import { IConfig, ISources } from "..";
import { BrowserMessage, HandleMessageCallback } from ".";

const UpdatedConfigMessageMethod = "UpdatedConfigMessage";

export class UpdatedConfigMessage {
    public method = UpdatedConfigMessageMethod;
    public config: IConfig;
    public sources: ISources;

    static check(request: BrowserMessage, fn: HandleMessageCallback): void {
        if (get(request, "method") === UpdatedConfigMessageMethod) {
            return fn(request);
        }
    }

    constructor(config: IConfig, sources: ISources) {
        this.method = UpdatedConfigMessageMethod;
        this.config = config;
        this.sources = sources;
    }
}
