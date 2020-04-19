import { get } from "lodash-es";

const ReportUnknownMessageMethod = "ReportUnknownMessage";

export type HandlerReportUnknownCallback = (response: ReportUnknownMessage) => void;

export class ReportUnknownMessage {
  public method = ReportUnknownMessageMethod;
  public domain: string;

  static check(request: any, fn: HandlerReportUnknownCallback) {
    if (get(request, "method") === ReportUnknownMessageMethod) {
      return fn(request);
    }
  }

  constructor(domain: string) {
    this.method = ReportUnknownMessageMethod;
    this.domain = domain;
  }
}
