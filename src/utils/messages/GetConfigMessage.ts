import { get } from "lodash-es";

const GetConfigMessageMethod = "GetConfigMessage";

export type HandlerGetConfigCallback = (response: GetConfigMessage) => void;

export class GetConfigMessage {
  public method = GetConfigMessageMethod;

  static check(request: any, fn: HandlerGetConfigCallback) {
    if (get(request, "method") === GetConfigMessageMethod) {
      return fn(request);
    }
  }

  constructor() {
    this.method = GetConfigMessageMethod;
  }
}
