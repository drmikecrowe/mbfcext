import { get } from "lodash-es";
import { BrowserMessage, HandleMessageCallback } from ".";

const GetConfigMessageMethod = "GetConfigMessage";

export class GetConfigMessage {
    public method = GetConfigMessageMethod;

    static check(request: BrowserMessage, fn: HandleMessageCallback): void {
        if (get(request, "method") === GetConfigMessageMethod) {
            return fn(request);
        }
    }

    constructor() {
        this.method = GetConfigMessageMethod;
    }
}
