import { get } from "lodash-es";
import { BrowserMessage, HandleMessageCallback } from ".";

const StartThanksMessageMethod = "StartThanksMessage";

export class StartThanksMessage {
    public method = StartThanksMessageMethod;

    static check(request: BrowserMessage, fn: HandleMessageCallback): void {
        if (get(request, "method") === StartThanksMessageMethod) {
            return fn(request);
        }
    }

    constructor() {
        this.method = StartThanksMessageMethod;
    }
}
