import { get } from "lodash-es";
import { ISource } from "@/utils/definitions";

const AssociateSiteMessageMethod = "AssociateSiteMessage";

export type HandlerAssociateSiteCallback = (response: AssociateSiteMessage) => void;

export class AssociateSiteMessage {
  public method = AssociateSiteMessageMethod;
  public source: ISource;
  public fb_url: string;

  static check(request: any, fn: HandlerAssociateSiteCallback) {
    if (get(request, "method") === AssociateSiteMessageMethod) {
      return fn(request);
    }
  }

  constructor(source: ISource, fb_url: string) {
    this.source = source;
    this.fb_url = fb_url;
  }
}
