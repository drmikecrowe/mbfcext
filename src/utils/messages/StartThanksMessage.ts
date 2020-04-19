const log = require("debug")("mbfc:utils:messages:StartThanksMessage");

import { get } from "lodash-es";
import { ISource } from "@/utils/definitions";

const StartThanksMessageMethod = "StartThanksMessage";

export type HandlerStartThanksCallback = (response: StartThanksMessage) => void;

export class StartThanksMessage {
  public method = StartThanksMessageMethod;

  static check(request: any, fn: HandlerStartThanksCallback) {
    if (get(request, "method") === StartThanksMessageMethod) {
      return fn(request);
    }
  }

  constructor() {
    this.method = StartThanksMessageMethod;
  }
}
