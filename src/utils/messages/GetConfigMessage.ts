const log = require("debug")("mbfc:utils:messages:GetConfigMessage");
import debug from "debug";
import { isDevMode } from "@/utils/utils";
import { HandlerCallbackType, IEmptyMessageRequest } from ".";
import { IConfig } from "@/utils/definitions";
import { browser } from "webextension-polyfill-ts";

isDevMode();

const GetConfigMessageMethod = "GetConfig";

export class GetConfigMessage {
  static tabId: number | null = null;

  constructor(fn: HandlerCallbackType) {
    log(`Initializing ${GetConfigMessageMethod}`);
    browser.runtime.onMessage.addListener(async (request: IEmptyMessageRequest, sender) => {
      if (request.method === GetConfigMessageMethod) {
        log(`Received ${GetConfigMessageMethod}Message`);
        const result: any = await fn(request);
        return result;
      }
    });
  }

  static async SendMessage(): Promise<IConfig | undefined> {
    try {
      log(`Requesting updated configuration`);
      const params: IEmptyMessageRequest = {
        method: GetConfigMessageMethod,
      };
      return new Promise((resolve) => browser.runtime.sendMessage(params, resolve));
    } catch (err) {
      console.log(err);
    }
  }
}
