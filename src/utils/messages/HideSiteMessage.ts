const log = require("debug")("mbfc:utils:messages:HideSiteMessage");
import debug from "debug";
import { isDevMode } from "@/utils/utils";
import { IEmptyMessageRequest, IEmptyMessageResponse } from ".";
import { ISource } from "@/utils/definitions";
import { browser } from "webextension-polyfill-ts";

isDevMode();

const HideSiteMessageMethod = "HideSite";

export interface IHideSiteRequest extends IEmptyMessageRequest {
  domain: string;
}

export interface IHideSiteResponse extends IEmptyMessageResponse {
  hiddenSites: any;
}

export type HandleHideSiteCallback = (request: IHideSiteRequest) => void;

export class HideSiteMessage {
  constructor(fn: HandleHideSiteCallback) {
    log(`Initializing ${HideSiteMessageMethod}`);
    browser.runtime.onMessage.addListener(async (request: IHideSiteRequest, sender) => {
      if (request.method === HideSiteMessageMethod) {
        log(`Received ${HideSiteMessageMethod}Message`);
        const result: any = await fn(request);
        return result;
      }
    });
  }

  static async SendMessage(source: ISource, hideState: boolean): Promise<boolean> {
    try {
      log(`Sending HideSiteMessage`);
      if (!source) {
        console.error(`ERROR/${HideSiteMessageMethod}: no source`);
        return false;
      }
      const params: IHideSiteRequest = {
        method: HideSiteMessageMethod,
        domain: source.d,
        // hideState,  TODO: what was this?
      };
      return new Promise((resolve) => browser.runtime.sendMessage(params, resolve));
    } catch (err) {
      console.log(err);
    }
    return false;
  }
}
