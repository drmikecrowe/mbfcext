import { get } from "lodash-es";

const HideSiteMessageMethod = "HideSiteMessage";

export type HandlerHideSiteCallback = (response: HideSiteMessage) => void;

export class HideSiteMessage {
  public method = HideSiteMessageMethod;
  public domain: string;

  static check(request: any, fn: HandlerHideSiteCallback) {
    if (get(request, "method") === HideSiteMessageMethod) {
      return fn(request);
    }
  }

  constructor(domain: string) {
    this.method = HideSiteMessageMethod;
    this.domain = domain;
  }
}
