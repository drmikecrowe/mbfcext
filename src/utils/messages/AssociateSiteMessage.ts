const log = require("debug")("mbfc:utils:messages:AssociateSiteMessage");
import debug from "debug";
import { isDevMode } from "@/utils/utils";
import { IEmptyMessageRequest } from ".";
import { ISource } from "@/utils/definitions";
import { browser } from "webextension-polyfill-ts";

isDevMode();

const AssociateSiteMessageMethod = "AssociateSite";

export interface IAssociateSiteRequest extends IEmptyMessageRequest {
  source: ISource;
  fb_url: string;
}

export type HandleAssociateSiteCallback = (request: IAssociateSiteRequest) => void;

export class AssociateSiteMessage {
  constructor(fn: HandleAssociateSiteCallback) {
    log(`Initializing ${AssociateSiteMessageMethod}`);
    browser.runtime.onMessage.addListener(async (request: IAssociateSiteRequest, sender) => {
      if (request.method === AssociateSiteMessageMethod) {
        log(`Received ${AssociateSiteMessageMethod}Message`);
        const result: any = await fn(request);
        return result;
      }
    });
  }

  static async SendMessage(site: ISource, fb_url): Promise<void> {
    try {
      log(`Requesting updated configuration`);
      if (!site) {
        console.error(`ERROR/${AssociateSiteMessageMethod}: no site`);
        return Promise.resolve();
      }
      const params: IAssociateSiteRequest = {
        method: AssociateSiteMessageMethod,
        source: site,
        fb_url,
      };
      return new Promise((resolve) => browser.runtime.sendMessage(params, resolve));
    } catch (err) {
      console.log(err);
    }
  }
}
