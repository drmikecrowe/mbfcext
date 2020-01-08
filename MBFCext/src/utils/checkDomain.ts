import { get } from "lodash";
import debug from 'debug';
import { isDevMode } from "../utils/utils";

isDevMode();
const log = debug("mbfc:checkDomain");

export const checkDomain = (domain: string, path: string, config: any) => {
    const ret = {
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
        if (d in config.sources) {
            ret.site = config.sources[d];
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