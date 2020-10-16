import debug from "debug";
const log = debug("mbfc:utils:checkDomain");

import { get } from "lodash";
import { ISource, ISources, IConfig } from "utils";

export interface ICheckDomain {
    final_domain: string;
    alias: boolean;
    baseUrl: boolean;
    hidden: boolean;
    collapse: boolean;
    unknown: boolean;
    site: ISource | null;
}

export const checkDomain = (
    domain: string,
    path: string,
    hiddenSites: Record<string, boolean>,
    collapse: any,
    sources: ISources
): ICheckDomain => {
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
            if (collapse[bias]) {
                ret.collapse = true;
            }
            if (reporting.toUpperCase().startsWith("M") && collapse.mixed) {
                ret.collapse = true;
            }
        }
        if (hiddenSites[d]) {
            ret.hidden = true;
            ret.collapse = true;
        } else if (hiddenSites[d] === false) {
            ret.collapse = false;
        }
        // log(ret);
        return !!ret.site;
    };

    if (_check(`${domain}${path}`, false, false)) return ret;
    if (_check(domain, false, false)) return ret;
    if (_check(sources.aliases[domain], true, false)) return ret;
    const elements = domain.split(".");
    let next_domain = elements.pop();
    next_domain = elements.pop() + "." + next_domain;
    if (_check(next_domain, false, true)) return ret;
    ret.unknown = true;
    return ret;
};
