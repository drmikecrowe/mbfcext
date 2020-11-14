export type TDomain = string;
export type TFacebookUrl = string;
export type THost = string;
export type TMozRankUrl = number;
export type TMozLinks = number;
export type TMozPopularity = number;
export type TSource = string;
export type TReporting = string;
export type TUrl = string;
export type TPath = string;

export interface ISource {
    /**
     * b: Bias -bias_text[rating.bias[0]],
     */
    b: string
    /**
     * d: Domain -rating.domain.replace(/^www\./, ""),
     */
    d: string
    /**
     * f: FacebookUrl -_.lowerCase(rating.facebook_url),
     */
    f: string
    /**
     * t: TwitterUrl -_.lowerCase(rating.twitter_url),
     */
    t: string
    /**
     * h: Host -`https://${rating.domain}`,
     */
    h: string
    /**
     * M: MozRankUrl -rating.moz_rank_url,
     */
    M: number
    /**
     * L: MozLinks -rating.moz_links,
     */
    L: number
    /**
     * P: MozPopularity -rating.moz_popularity,
     */
    P: number
    /**
     * n: Source -rating.source,
     */
    n: string
    /**
     * r: Reporting -_.upperCase(_.kebabCase(_.first(rating.factual_reporting))),
     */
    r: string
    /**
     * u: Url -url,
     */
    u: string
    /**
     * p: Path -path,
     */
    p: string
}

export interface IBias {
    name: string;
    description: string;
    url: string;
}

export interface IReporting {
    pretty: string;
}

export interface IConfig {
    sources: Record<string, ISource>;
    biases: Record<string, IBias>;
    aliases: Record<string, string>;
    reporting: Record<string, IReporting>;
    hiddenSites: Record<string, boolean>;
    collapse: any;
    fb_pages: Record<string, string>;
    tw_pages: Record<string, string>;
    unknown: Record<string, boolean>,
    loaded: boolean;
} 

