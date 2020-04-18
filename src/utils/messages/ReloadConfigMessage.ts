const log = require("debug")("mbfc:utils:messages:ReloadConfigMessage");
import debug from "debug";
import { isDevMode } from "@/utils/utils";
import { HandlerCallbackType, IEmptyMessageRequest } from ".";
import { browser } from "webextension-polyfill-ts";

isDevMode();

const ReloadConfigMessageMethod = "ReloadConfig";

export class ReloadConfigMessage {
  constructor(fn: HandlerCallbackType) {
    log(`Initializing ${ReloadConfigMessageMethod}`);
    browser.runtime.onMessage.addListener(async (request: IEmptyMessageRequest, sender) => {
      if (request.method === ReloadConfigMessageMethod) {
        log(`Received ${ReloadConfigMessageMethod}Message`);
        const result: any = await fn(request);
        return result;
      }
    });
  }

  static async SendMessage(): Promise<void> {
    try {
      log(`Sending $1`);
      const params: IEmptyMessageRequest = {
        method: ReloadConfigMessageMethod,
      };
      return new Promise((resolve) => browser.runtime.sendMessage(params, resolve));
    } catch (err) {
      console.log(err);
    }
  }
}
