const log = require("debug")("mbfc:utils:messages:ReportUnknownMessage");
import debug from "debug";
import { isDevMode } from "@/utils/utils";
import { IEmptyMessageRequest } from ".";
import { browser } from "webextension-polyfill-ts";

isDevMode();

const ReportUnknownMessageMethod = "ReportUnknown";

export interface IReportUnknownRequest extends IEmptyMessageRequest {
  domain: string;
}

export type HandleReportUnknownCallback = (request: IReportUnknownRequest) => void;

export class ReportUnknownMessage {
  constructor(fn: HandleReportUnknownCallback) {
    log(`Initializing ${ReportUnknownMessageMethod}`);
    browser.runtime.onMessage.addListener(async (request: IReportUnknownRequest, sender) => {
      if (request.method === ReportUnknownMessageMethod) {
        log(`Received ${ReportUnknownMessageMethod}Message`);
        const result: any = await fn(request);
        return result;
      }
    });
  }

  static async SendMessage(domain: string): Promise<void> {
    try {
      log(`Sending $1`);
      const params: IReportUnknownRequest = {
        method: ReportUnknownMessageMethod,
        domain,
      };
      return new Promise((resolve) => browser.runtime.sendMessage(params, resolve));
    } catch (err) {
      console.log(err);
    }
  }
}
