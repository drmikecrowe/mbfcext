const log = require("debug")("mbfc:utils:messages:ShowOptionsMessage");
import debug from "debug";
import { isDevMode } from "@/utils/utils";
import { HandlerCallbackType, IEmptyMessageRequest } from ".";
import { browser } from "webextension-polyfill-ts";

isDevMode();

const ShowOptionsMessageMethod = "ShowOptions";

export class ShowOptionsMessage {
  constructor(fn: HandlerCallbackType) {
    log(`Initializing ${ShowOptionsMessageMethod}`);
    browser.runtime.onMessage.addListener(async (request: IEmptyMessageRequest, sender) => {
      if (request.method === ShowOptionsMessageMethod) {
        log(`Received ${ShowOptionsMessageMethod}Message`);
        const result: any = await fn(request);
        return result;
      }
    });
  }

  static async SendMessage(): Promise<void> {
    try {
      log(`Sending $1`);
      const params: IEmptyMessageRequest = {
        method: ShowOptionsMessageMethod,
      };
      return new Promise((resolve) => browser.runtime.sendMessage(params, resolve));
    } catch (err) {
      console.log(err);
    }
  }
}
