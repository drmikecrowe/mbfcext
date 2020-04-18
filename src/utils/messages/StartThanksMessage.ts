const log = require("debug")("mbfc:utils:messages:StartThanksMessage");
import debug from "debug";
import { isDevMode } from "@/utils/utils";
import { HandlerCallbackType, IEmptyMessageRequest } from ".";
import { browser } from "webextension-polyfill-ts";

isDevMode();

const StartThanksMessageMethod = "StartThanks";

export class StartThanksMessage {
  constructor(fn: HandlerCallbackType) {
    log(`Initializing ${StartThanksMessageMethod}`);
    browser.runtime.onMessage.addListener(async (request: IEmptyMessageRequest, sender) => {
      if (request.method === StartThanksMessageMethod) {
        log(`Received ${StartThanksMessageMethod}Message`);
        const result: any = await fn(request);
        return result;
      }
    });
  }

  static async SendMessage(): Promise<void> {
    try {
      log(`Sending $1`);
      const params: IEmptyMessageRequest = {
        method: StartThanksMessageMethod,
      };
      return new Promise((resolve) => browser.runtime.sendMessage(params, resolve));
    } catch (err) {
      console.log(err);
    }
  }
}
