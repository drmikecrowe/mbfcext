import storageCache from "webext-storage-cache";
import { StorageArea } from "@spadin/webextension-storage";
import { COMBINED } from "./constants";
import { isDevMode } from "./utils";
import { fetch as fetchPolyfill } from "whatwg-fetch";

import cache from "webext-storage-cache";

const devMode = isDevMode();

export type TDomain = string;
export type TFacebookUrl = string;
export type THost = string;
export type TPopularity = number;
export type TSource = string;
export type TReporting = string;
export type TUrl = string;
export type TPath = string;

export enum ERporting {
  HIGH = "H",
  LOW = "L",
  MIXED = "M",
  MOSTLY_FACTUAL = "MF",
  VERY_HIGH = "VH",
  VERY_LOW = "VL",
}

export const enum EBiases {
  CENTER = "C",
  CONSPIRACY = "CP",
  FAKE_NEWS = "FN",
  LEFT = "L",
  LEFT_CENTER = "LC",
  PRO_SCIENCE = "PS",
  RIGHT = "R",
  RIGHT_CENTER = "RC",
  SATIRE = "S",
}

export interface ISource {
  /**
   * b: Bias -bias_text[rating.bias[0]],
   */
  b: string;
  /**
   * d: Domain -rating.domain.replace(/^www\./, ""),
   */
  d: string;
  /**
   * f: FacebookUrl -_.lowerCase(rating.facebook_url),
   */
  f: string;
  /**
   * t: TwitterUrl -_.lowerCase(rating.twitter_url),
   */
  t: string;
  /**
   * h: Host -`https://${rating.domain}`,
   */
  h: string;
  /**
   * M: MozRankUrl -rating.moz_rank_url,
   */
  M: number;
  /**
   * L: MozLinks -rating.moz_links,
   */
  L: number;
  /**
   * P: MozPopularity -rating.moz_popularity,
   */
  P: number;
  /**
   * n: Source -rating.source,
   */
  n: string;
  /**
   * r: Reporting -_.upperCase(_.kebabCase(_.first(rating.factual_reporting))),
   */
  r: string;
  /**
   * u: Url -url,
   */
  u: string;
  /**
   * p: Path -path,
   */
  p: string;
}

export interface IBias {
  name: string;
  description: string;
  url: string;
}

export interface IReporting {
  pretty: string;
}

export interface ISiteConfig {
  // From combined
  sources: Record<TDomain, ISource>;
  aliases: Record<TDomain, string>;
  biases: Partial<Record<EBiases, IBias>>;
  reporting: Partial<Record<ERporting, IReporting>>;
}

export interface IUserConfig {
  // From local storage
  hiddenSites: Record<TDomain, boolean>;
  collapse: Partial<Record<EBiases, boolean>>;
  fb_pages: Record<TDomain, string>;
  tw_pages: Record<TDomain, string>;
  unknown: Record<TDomain, boolean>;
  loaded: boolean;
}

export const siteStorage = StorageArea.create<ISiteConfig>({
  defaults: {
    sources: {},
    aliases: {},
    biases: {},
    reporting: {},
  },
});

const getCombined = async (): Promise<any> => {
  return fetch(COMBINED)
    .then((response) => response.json())
    .then((results: ISiteConfig) => siteStorage.set(results));
};

export const cachedGetCombined = cache.function(getCombined, {
  expiration: 1,
  cacheKey: () => "combined",
});

export const userStorage = StorageArea.create<IUserConfig>({
  defaults: {
    hiddenSites: {},
    collapse: {},
    fb_pages: {},
    tw_pages: {},
    unknown: {},
    loaded: false,
  },
});
