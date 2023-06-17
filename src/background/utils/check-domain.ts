import { Result, err, ok } from "neverthrow"

import type { SourceData } from "~background/sources-processor"
import { ReportingEnums, type SiteModel } from "~models/combined-manager"
import { type ConfigStorage, StorageToOptions, logger } from "~shared"

export interface CheckDomainResults {
  final_domain: string
  alias: boolean
  baseUrl: boolean
  hidden: boolean
  collapse: boolean
  unknown: boolean
  site: SiteModel | null
  suggested_fbtwpath?: string
}

const logged: Record<string, boolean> = {}

export function checkDomain(domain: string, path: string, sources: SourceData, config: ConfigStorage): Result<CheckDomainResults, null> {
  const log = logger("mbfc:utils:checkDomain")

  const ret: CheckDomainResults = {
    final_domain: domain,
    alias: false,
    baseUrl: false,
    hidden: false,
    collapse: false,
    unknown: true,
    site: null,
  }
  if (!domain) {
    return ok(ret)
  }

  const ch = (d: string, isAlias: boolean, isBase: boolean) => {
    if (d in sources.sites_by_domain) {
      ret.site = sources.sites_by_domain[d]
      ret.final_domain = d
      ret.unknown = false
      ret.alias = isAlias
      ret.baseUrl = isBase
      // const bias: EBiasesKey = get(ret, "site.b", "")
      // const reporting: EReportingKeys = get(ret, "site.r", "")
      if (config.collapse[StorageToOptions[ret.site.bias]]) {
        ret.collapse = true
      }
      if (ret.site.reporting === ReportingEnums.Mixed && config.collapse.collapseMixed) {
        ret.collapse = true
      }
    }
    if (config.hiddenSites[d]) {
      ret.hidden = true
      ret.collapse = true
    } else if (d in config.hiddenSites && config.hiddenSites[d] === false) {
      ret.collapse = false
    }
    if (ret.site && !logged[d]) {
      logged[d] = true
      log(ret)
    }
    // log(ret);
    return !!ret.site
  }

  if (ch(`${domain}/${path}`, false, false)) return ok(ret)
  for (const sd in sources.subdomains) {
    const sdk = Object.keys(sources.subdomains[sd])
    if (sdk.length > 1) {
      if (sdk[0] === "/") {
        // Check this last
        sdk.shift()
        sdk.push("/")
      }
      for (const start of sdk) {
        if (path && path.startsWith(start)) {
          if (ch(`${domain}${start}`, false, false)) return ok(ret)
        }
      }
    }
  }
  if (ch(domain, false, false)) return ok(ret)
  if (ch(sources.combined.aliases[domain], true, false)) return ok(ret)
  const elements = domain.split(".")
  let next_domain = elements.pop()
  next_domain = `${elements.pop()}.${next_domain}`
  if (ch(next_domain, false, true)) return ok(ret)
  ret.unknown = true
  return ok(ret)
}
