const log = require("debug")("mbfc:utils:messages:ShowSiteMessage");
import debug from "debug";
import { isDevMode } from "@/utils/utils";
import { HandlerCallbackType, IEmptyMessageRequest } from ".";
import { ISource } from "@/utils/definitions";
import { browser } from "webextension-polyfill-ts";

isDevMode();

const ShowSiteMessageMethod = "ShowSite";

export interface IShowSiteRequest extends IEmptyMessageRequest {
  source: ISource;
  isAlias: boolean;
  isBase: boolean;
  isCollapsed: boolean;
}

export type HandlerShowSiteCallback = (request: IShowSiteRequest) => void;

export class ShowSiteMessage {
  constructor(fn: HandlerShowSiteCallback) {
    log(`Initializing ${ShowSiteMessageMethod}`);
    browser.runtime.onMessage.addListener(async (request: IShowSiteRequest, sender) => {
      if (request.method === ShowSiteMessageMethod) {
        log(`Received ${ShowSiteMessageMethod}Message`);
        const result: any = await fn(request);
        return result;
      }
    });
  }

  static async SendMessage(source: ISource, isAlias: boolean, isBase: boolean, isCollapsed: boolean): Promise<void> {
    try {
      log(`Sending ShowSiteMessageMethod`);
      const params: IShowSiteRequest = {
        method: ShowSiteMessageMethod,
        source,
        isAlias,
        isBase,
        isCollapsed,
      };
      return new Promise((resolve) => browser.runtime.sendMessage(params, resolve));
    } catch (err) {
      console.log(err);
    }
  }
}
