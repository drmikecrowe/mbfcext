export type TDomain = string;
export type TFacebookUrl = string;
export type THost = string;
export type TPopularity = number;
export type TSource = string;
export type TReporting = string;
export type TUrl = string;
export type TPath = string;

/**
  Left
  Left-Center
  Least Biased
  Right-Center
  Right
  Pro-Science
  Questionable Sources
  Conspiracy-Pseudoscience
  Satire
 */
export enum EBiases {
  "C" = "Least Biased",
  "CP" = "Conspiracy-Pseudoscience",
  "FN" = "Questionable Sources",
  "L" = "Left",
  "LC" = "Left-Center",
  "PS" = "Pro-Science",
  "R" = "Right",
  "RC" = "Right-Center",
  "S" = "Satire",
}
export type EBiasesKey = keyof typeof EBiases;

export enum EReporting {
  "H" = "high",
  "L" = "low",
  "M" = "mixed",
  "MF" = "mostly_factual",
  "VH" = "very_high",
  "VL" = "very_low",
}
export type EReportingKeys = keyof typeof EReporting;

export enum EReportingText {
  "H" = "Highly Factual",
  "L" = "Low Factuality",
  "M" = "Mixed Factuality",
  "MF" = "Mostly Factual",
  "VH" = "Very High Factuality",
  "VL" = "Very Low Factuality",
}
/**
  H|High Credibility
  M|Medium Credibility
  L|Low Credibility
  NA|N/A
 */
export enum ECredibility {
  "H" = "High Credibility",
  "M" = "Medium Credibility",
  "L" = "Low Credibility",
  "NA" = "N/A",
}
export type ECredibilityKeys = keyof typeof ECredibility;

/**
  N|No Data
  L|Minimal Traffic
  M|Medium Traffic
  H|High Traffic
 */
export enum ETraffic {
  "N" = "No Data",
  "L" = "Minimal Traffic",
  "M" = "Medium Traffic",
  "H" = "High Traffic",
}
export type ETrafficKeys = keyof typeof ETraffic;

export interface ISource {
  /**
   * b: Bias -bias_text[rating.bias[0]],
   */
  b: EBiasesKey;
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
   * P: MBFC Popularity
   */
  P: number;
  /**
   * n: Source -rating.source,
   */
  n: string;
  /**
   * r: Reporting -_.upperCase(_.kebabCase(_.first(rating.factual_reporting))),
   */
  r: EReportingKeys;
  /**
   * u: Url -url,
   */
  u: string;
  /**
   * p: Path -path,
   */
  p: string;
  /**
   * MBFC Credibility
   */
  c: ECredibilityKeys;
  /**
   * Traffic
   */
  a: ETrafficKeys;
}

export interface IBias {
  name: string;
  description: string;
  url: string;
}

export interface IReporting {
  pretty: string;
}

export interface ICombined {
  version: number;
  date: string;
  sources: Record<string, ISource>;
  aliases: Record<string, string>;
  reporting: Record<string, IReporting>;
  biases: Record<string, IBias>;
  traffic: Record<ETrafficKeys, ETraffic>;
  credibility: Record<ECredibilityKeys, ECredibility>;
}

export interface ISources extends ICombined {
  subdomains: Record<string, Record<string, ISource>>;
  fb_pages: Record<string, string>;
  tw_pages: Record<string, string>;
  loaded: boolean;
}
