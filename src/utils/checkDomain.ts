export {};
const log = debug("mbfc:utils:checkDomain");

import { get } from "lodash";
import debug from "debug";
import { isDevMode } from "../utils/utils";
import { ISource, ISources, IConfig } from "./definitions";

isDevMode();

export interface ICheckDomain {
  final_domain: string;
  alias: boolean;
  baseUrl: boolean;
  hidden: boolean;
  collapse: boolean;
  unknown: boolean;
  site: ISource | null;
}

export const checkDomain = (domain: string, path: string, config: IConfig, sources: ISources): ICheckDomain => {
  const ret: ICheckDomain = {
    final_domain: domain,
    alias: false,
    baseUrl: false,
    hidden: false,
    collapse: false,
    unknown: true,
    site: null,
  };
  if (!domain) {
    return ret;
  }

  const _check = (d: string, isAlias: boolean, isBase: boolean) => {
    if (d in sources.sources) {
      ret.site = sources.sources[d];
      ret.final_domain = d;
      ret.unknown = false;
      ret.alias = isAlias;
      ret.baseUrl = isBase;
      const bias = get(ret, "site.b");
      const reporting = get(ret, "site.r", "");
      if (config.collapse[bias]) {
        ret.collapse = true;
      }
      if (reporting.toUpperCase() === "MIXED" && config.collapse.mixed) {
        ret.collapse = true;
      }
    }
    if (config.hiddenSites[d]) {
      ret.hidden = true;
      ret.collapse = true;
    } else if (config.hiddenSites[d] === false) {
      ret.collapse = false;
    }
    // log(ret);
    return !!ret.site;
  };

  if (_check(`${domain}${path}`, false, false)) return ret;
  if (_check(domain, false, false)) return ret;
  if (_check(config.aliases[domain], true, false)) return ret;
  var elements = domain.split(".");
  var next_domain = elements.pop();
  next_domain = elements.pop() + "." + next_domain;
  if (_check(next_domain, false, true)) return ret;
  ret.unknown = true;
  return ret;
};
