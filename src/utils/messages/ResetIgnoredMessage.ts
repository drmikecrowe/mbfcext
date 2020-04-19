import { get } from "lodash-es";

const ResetIgnoredMessageMethod = "ResetIgnoredMessage";

export type HandlerResetIgnoredCallback = (response: ResetIgnoredMessage) => void;

export class ResetIgnoredMessage {
  public method = ResetIgnoredMessageMethod;

  static check(request: any, fn: HandlerResetIgnoredCallback) {
    if (get(request, "method") === ResetIgnoredMessageMethod) {
      return fn(request);
    }
  }

  constructor() {
    this.method = ResetIgnoredMessageMethod;
  }
}
