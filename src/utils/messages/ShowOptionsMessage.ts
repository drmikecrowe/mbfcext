const log = require("debug")("mbfc:utils:messages:ShowOptionsMessage");

import { get } from "lodash-es";
import { ISource } from "@/utils/definitions";

const ShowOptionsMessageMethod = "ShowOptionsMessage";

export type HandlerShowOptionsCallback = (response: ShowOptionsMessage) => void;

export class ShowOptionsMessage {
  public method = ShowOptionsMessageMethod;

  static check(request: any, fn: HandlerShowOptionsCallback) {
    if (get(request, "method") === ShowOptionsMessageMethod) {
      return fn(request);
    }
  }

  constructor() {
    this.method = ShowOptionsMessageMethod;
  }
}
