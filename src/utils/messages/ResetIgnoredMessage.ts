const log = require("debug")("mbfc:utils:messages:ResetIgnoredMessage");
import debug from "debug";
import { isDevMode } from "@/utils/utils";
import { HandlerCallbackType, IEmptyMessageRequest } from ".";
import { browser } from "webextension-polyfill-ts";

isDevMode();

const ResetIgnoredMessageMethod = "ResetIgnored";

export class ResetIgnoredMessage {
  constructor(fn: HandlerCallbackType) {
    log(`Initializing ${ResetIgnoredMessageMethod}`);
    browser.runtime.onMessage.addListener(async (request: IEmptyMessageRequest, sender) => {
      if (request.method === ResetIgnoredMessageMethod) {
        log(`Received ${ResetIgnoredMessageMethod}Message`);
        const result: any = await fn(request);
        return result;
      }
    });
  }

  static async SendMessage(): Promise<void> {
    try {
      log(`Sending $1`);
      const params: IEmptyMessageRequest = {
        method: ResetIgnoredMessageMethod,
      };
      return new Promise((resolve) => browser.runtime.sendMessage(params, resolve));
    } catch (err) {
      console.log(err);
    }
  }
}
