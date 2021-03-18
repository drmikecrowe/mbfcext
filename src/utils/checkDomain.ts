import { get, has } from "lodash";
import { err, ok, Result } from "neverthrow";
import { EBiasesKey, EReportingKeys, ISource } from "utils/definitions";
import { StorageToOptions } from "utils/definitions";
import { logger } from "utils/logger";
import { SourcesHandler } from "utils/SourcesHandler";
import { ConfigHandler } from "utils/ConfigHandler";

const log = logger("mbfc:utils:checkDomain");

export interface CheckDomainResults {
  final_domain: string;
  alias: boolean;
  baseUrl: boolean;
  hidden: boolean;
  collapse: boolean;
  unknown: boolean;
  site: ISource | null;
}

const logged: Record<string, boolean> = {};

export const checkDomain = (
  domain: string,
  path: string
): Result<CheckDomainResults, null> => {
  const ret: CheckDomainResults = {
    final_domain: domain,
    alias: false,
    baseUrl: false,
    hidden: false,
    collapse: false,
    unknown: true,
    site: null,
  };
  if (!domain) {
    return ok(ret);
  }

  const s = SourcesHandler.getInstance().sources;
  if (s.isErr()) {
    log("No sources");
    return err(null);
  }
  const sources = s.value;

  const c = ConfigHandler.getInstance().config;
  if (c.isErr()) {
    log("No config");
    return err(null);
  }
  const config = c.value;

  const ch = (d: string, isAlias: boolean, isBase: boolean) => {
    if (d in sources.sources) {
      ret.site = sources.sources[d];
      ret.final_domain = d;
      ret.unknown = false;
      ret.alias = isAlias;
      ret.baseUrl = isBase;
      const bias: EBiasesKey = get(ret, "site.b", "");
      const reporting: EReportingKeys = get(ret, "site.r", "");
      if (config.collapse[StorageToOptions[bias]]) {
        ret.collapse = true;
      }
      if (reporting === "M" && config.collapse.collapseMixed) {
        ret.collapse = true;
      }
    }
    if (config.hiddenSites[d]) {
      ret.hidden = true;
      ret.collapse = true;
    } else if (has(config.hiddenSites, d) && config.hiddenSites[d] === false) {
      ret.collapse = false;
    }
    if (ret.site && !logged[d]) {
      logged[d] = true;
      log(ret);
    }
    // log(ret);
    return !!ret.site;
  };

  if (ch(`${domain}${path}`, false, false)) return ok(ret);
  for (const sd in sources.subdomains) {
    const sdk = Object.keys(sources.subdomains[sd]);
    if (sdk.length > 1) {
      if (sdk[0] === "/") {
        // Check this last
        sdk.shift();
        sdk.push("/");
      }
      for (const start of sdk) {
        if (path && path.startsWith(start)) {
          if (ch(`${domain}${start}`, false, false)) return ok(ret);
        }
      }
    }
  }
  if (ch(domain, false, false)) return ok(ret);
  if (ch(sources.aliases[domain], true, false)) return ok(ret);
  const elements = domain.split(".");
  let next_domain = elements.pop();
  next_domain = `${elements.pop()}.${next_domain}`;
  if (ch(next_domain, false, true)) return ok(ret);
  ret.unknown = true;
  return ok(ret);
};
