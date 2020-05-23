import { get } from "lodash-es";
import { BrowserMessage, HandleMessageCallback } from ".";

const ReloadConfigMessageMethod = "ReloadConfigMessage";

export class ReloadConfigMessage {
    public method = ReloadConfigMessageMethod;

    static check(request: BrowserMessage, fn: HandleMessageCallback): void {
        if (get(request, "method") === ReloadConfigMessageMethod) {
            return fn(request);
        }
    }

    constructor() {
        this.method = ReloadConfigMessageMethod;
    }
}
