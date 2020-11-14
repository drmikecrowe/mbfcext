import get from "lodash/get";
import { err, ok, Result } from "neverthrow";
import { ConfigHandler, ISource, logger, SourcesHandler } from "utils";
import { StorageToOptions, ERporting } from "utils/StorageHandler";

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

    const _sources = SourcesHandler.getInstance().sources;
    if (_sources.isErr()) return err(null);
    const sources = _sources.value;

    const _config = ConfigHandler.getInstance().config;
    if (_config.isErr()) return err(null);
    const config = _config.value;

    const _check = (d: string, isAlias: boolean, isBase: boolean) => {
        if (d in sources.sources) {
            ret.site = sources.sources[d];
            ret.final_domain = d;
            ret.unknown = false;
            ret.alias = isAlias;
            ret.baseUrl = isBase;
            const bias = get(ret, "site.b");
            const biasKey = get(StorageToOptions, bias);
            const reporting = get(ret, "site.r", "").toUpperCase();
            if (config.collapse[biasKey]) {
                ret.collapse = true;
            }
            if (
                reporting === ERporting.MIXED &&
                config.collapse.collapseMixed
            ) {
                ret.collapse = true;
            }
        }
        if (config.hiddenSites[d]) {
            ret.hidden = true;
            ret.collapse = true;
        } else if (config.hiddenSites[d] === false) {
            ret.collapse = false;
        }
        if (ret.site && !logged[d]) {
            logged[d] = true;
            log(ret);
        }
        // log(ret);
        return !!ret.site;
    };

    if (_check(`${domain}${path}`, false, false)) return ok(ret);
    if (_check(domain, false, false)) return ok(ret);
    if (_check(sources.aliases[domain], true, false)) return ok(ret);
    const elements = domain.split(".");
    let next_domain = elements.pop();
    next_domain = `${elements.pop()}.${next_domain}`;
    if (_check(next_domain, false, true)) return ok(ret);
    ret.unknown = true;
    return ok(ret);
};
