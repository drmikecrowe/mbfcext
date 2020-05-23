import { get } from "lodash-es";
import { BrowserMessage, HandleMessageCallback } from ".";

const ShowOptionsMessageMethod = "ShowOptionsMessage";

export class ShowOptionsMessage {
    public method = ShowOptionsMessageMethod;

    static check(request: BrowserMessage, fn: HandleMessageCallback): void {
        if (get(request, "method") === ShowOptionsMessageMethod) {
            return fn(request);
        }
    }

    constructor() {
        this.method = ShowOptionsMessageMethod;
    }
}
