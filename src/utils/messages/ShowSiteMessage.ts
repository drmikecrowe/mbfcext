import { get } from "lodash-es";
import { ISource } from "@/utils/definitions";

const ShowSiteMessageMethod = "ShowSite";

export type HandlerShowSiteCallback = (response: ShowSiteMessage) => void;

export class ShowSiteMessage {
  public method = ShowSiteMessageMethod;
  public source: ISource;
  public isAlias: boolean;
  public isBase: boolean;
  public isCollapsed: boolean;

  static check(request: any, fn: HandlerShowSiteCallback) {
    if (get(request, "method") === ShowSiteMessageMethod) {
      return fn(request);
    }
  }

  constructor(source: ISource, isAlias: boolean, isBase: boolean, isCollapsed: boolean) {
    this.method = ShowSiteMessageMethod;
    this.source = source;
    this.isAlias = isAlias;
    this.isBase = isBase;
    this.isCollapsed = isCollapsed;
  }
}
