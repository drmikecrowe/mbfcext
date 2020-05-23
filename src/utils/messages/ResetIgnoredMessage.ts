import { get } from "lodash-es";
import { BrowserMessage, HandleMessageCallback } from ".";

const ResetIgnoredMessageMethod = "ResetIgnoredMessage";
export class ResetIgnoredMessage {
    public method = ResetIgnoredMessageMethod;

    static check(request: BrowserMessage, fn: HandleMessageCallback): void {
        if (get(request, "method") === ResetIgnoredMessageMethod) {
            return fn(request);
        }
    }

    constructor() {
        this.method = ResetIgnoredMessageMethod;
    }
}
