const log = require("debug")("mbfc:utils:messages:ReloadConfigMessage");

import { get } from "lodash-es";
import { ISource } from "@/utils/definitions";

const ReloadConfigMessageMethod = "ReloadConfigMessage";

export type HandlerReloadConfigCallback = (response: ReloadConfigMessage) => void;

export class ReloadConfigMessage {
  public method = ReloadConfigMessageMethod;

  static check(request: any, fn: HandlerReloadConfigCallback) {
    if (get(request, "method") === ReloadConfigMessageMethod) {
      return fn(request);
    }
  }

  constructor() {
    this.method = ReloadConfigMessageMethod;
  }
}
