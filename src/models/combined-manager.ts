// eslint-disable

// To parse this data:
//
//   import { Convert, CombinedModel } from "./file";
//
//   const combinedModel = Convert.toCombinedModel(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

/**
 * Distribution format for single data pull
 */
export interface CombinedModel {
  date: string
  version: number
  aliases: { [key: string]: any }
  biases: BiasModel[]
  credibility: CredibilityModel[]
  questionable: QuestionableModel[]
  reporting: ReportingModel[]
  sources: SiteModel[]
  traffic: TrafficModel[]
}

/**
 * A bias record
 */
export interface BiasModel {
  bias: BiasEnums
  code: BiasCodes
  /**
   * The description of the bias
   */
  description: string
  /**
   * The human-friendly name of the bias
   */
  name: string
  /**
   * The human friendly name for the bias
   */
  pretty: string
  /**
   * The URL on https://mediabiasfactcheck.com for the bias
   */
  url: string
}

/**
 * Allowed enums for bias
 */
export enum BiasEnums {
  Center = "center",
  ConspiracyPseudoscience = "conspiracy-pseudoscience",
  FakeNews = "fake-news",
  Left = "left",
  LeftCenter = "left-center",
  ProScience = "pro-science",
  Right = "right",
  RightCenter = "right-center",
  Satire = "satire",
}

/**
 * Allowed enums for bias
 */
export enum BiasCodes {
  C = "C",
  Cp = "CP",
  Fn = "FN",
  L = "L",
  Lc = "LC",
  PS = "PS",
  R = "R",
  RC = "RC",
  S = "S",
}

/**
 * credibility-model model description
 */
export interface CredibilityModel {
  code: CredibilityCodes
  credibility: CredibilityEnums
  name: string
  pretty: string
}

/**
 * Allowed enums for credibility
 */
export enum CredibilityCodes {
  H = "H",
  L = "L",
  M = "M",
  Na = "NA",
}

/**
 * Allowed enums for credibility
 */
export enum CredibilityEnums {
  HighCredibility = "high-credibility",
  LowCredibility = "low-credibility",
  MediumCredibility = "medium-credibility",
  NA = "n/a",
}

/**
 * questionable-model model description
 */
export interface QuestionableModel {
  code: QuestionableCodes
  name: string
  pretty: string
  questionable: QuestionableEnums
}

/**
 * Allowed enums for questionable
 */
export enum QuestionableCodes {
  C = "C",
  Cen = "CEN",
  Fc = "FC",
  Ffc = "FFC",
  Fn = "FN",
  H = "H",
  IM = "IM",
  Lot = "LOT",
  M = "M",
  Na = "NA",
  P = "P",
  PG = "PG",
  PS = "PS",
  Pse = "PSE",
}

/**
 * Allowed enums for questionable
 */
export enum QuestionableEnums {
  Censorship = "censorship",
  Conspiracy = "conspiracy",
  FailedFactChecks = "failed-fact-checks",
  FakeNews = "fake-news",
  FalseClaims = "false-claims",
  Hate = "hate",
  Imposter = "imposter",
  LackOfTransparency = "lack-of-transparency",
  Misinformation = "misinformation",
  NA = "n/a",
  Plagiarism = "plagiarism",
  PoorSourcing = "poor-sourcing",
  Propaganda = "propaganda",
  Pseudoscience = "pseudoscience",
}

/**
 * reporting-model model description
 */
export interface ReportingModel {
  code: ReportingCodes
  name: string
  pretty: string
  reporting: ReportingEnums
}

/**
 * Allowed enums for reporting
 */
export enum ReportingCodes {
  H = "H",
  L = "L",
  M = "M",
  MF = "MF",
  Vh = "VH",
  Vl = "VL",
}

/**
 * Allowed enums for reporting
 */
export enum ReportingEnums {
  High = "high",
  Low = "low",
  Mixed = "mixed",
  MostlyFactual = "mostly-factual",
  VeryHigh = "very-high",
  VeryLow = "very-low",
}

/**
 * site-model model description
 */
export interface SiteModel {
  bias: BiasEnums
  credibility?: CredibilityEnums
  /**
   * The domain name
   */
  domain: string
  /**
   * The human-friendly name for the site
   */
  name: string
  /**
   * The MBFC popularity rating for the site
   */
  popularity?: number
  questionable: QuestionableEnums[]
  reporting?: ReportingEnums
  traffic?: TrafficEnums
  /**
   * The URL on https://mediabiasfactcheck.com for the site
   */
  url: string
}

/**
 * Allowed enums for traffic
 */
export enum TrafficEnums {
  HighTraffic = "high-traffic",
  MediumTraffic = "medium-traffic",
  MinimalTraffic = "minimal-traffic",
  NoData = "no-data",
}

/**
 * traffic-model model description
 */
export interface TrafficModel {
  code: TrafficCodes
  name: string
  pretty: string
  traffic: TrafficEnums
}

/**
 * Allowed enums for traffic
 */
export enum TrafficCodes {
  H = "H",
  L = "L",
  M = "M",
  N = "N",
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
  public static toCombinedModel(json: string): CombinedModel {
    return cast(JSON.parse(json), r("CombinedModel"))
  }

  public static combinedModelToJson(value: CombinedModel): string {
    return JSON.stringify(uncast(value, r("CombinedModel")), null, 2)
  }
}

function invalidValue(typ: any, val: any, key: any = ""): never {
  if (key) {
    throw Error(`Invalid value for key "${key}". Expected type ${JSON.stringify(typ)} but got ${JSON.stringify(val)}`)
  }
  throw Error(`Invalid value ${JSON.stringify(val)} for type ${JSON.stringify(typ)}`)
}

function jsonToJSProps(typ: any): any {
  if (typ.jsonToJS === undefined) {
    const map: any = {}
    typ.props.forEach((p: any) => (map[p.json] = { key: p.js, typ: p.typ }))
    typ.jsonToJS = map
  }
  return typ.jsonToJS
}

function jsToJSONProps(typ: any): any {
  if (typ.jsToJSON === undefined) {
    const map: any = {}
    typ.props.forEach((p: any) => (map[p.js] = { key: p.json, typ: p.typ }))
    typ.jsToJSON = map
  }
  return typ.jsToJSON
}

function transform(val: any, typ: any, getProps: any, key: any = ""): any {
  function transformPrimitive(typ: string, val: any): any {
    if (typeof typ === typeof val) return val
    return invalidValue(typ, val, key)
  }

  function transformUnion(typs: any[], val: any): any {
    // val must validate against one typ in typs
    const l = typs.length
    for (let i = 0; i < l; i++) {
      const typ = typs[i]
      try {
        return transform(val, typ, getProps)
      } catch (_) {}
    }
    return invalidValue(typs, val)
  }

  function transformEnum(cases: string[], val: any): any {
    if (cases.indexOf(val) !== -1) return val
    return invalidValue(cases, val)
  }

  function transformArray(typ: any, val: any): any {
    // val must be an array with no invalid elements
    if (!Array.isArray(val)) return invalidValue("array", val)
    return val.map((el) => transform(el, typ, getProps))
  }

  function transformDate(val: any): any {
    if (val === null) {
      return null
    }
    const d = new Date(val)
    if (isNaN(d.valueOf())) {
      return invalidValue("Date", val)
    }
    return d
  }

  function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
    if (val === null || typeof val !== "object" || Array.isArray(val)) {
      return invalidValue("object", val)
    }
    const result: any = {}
    Object.getOwnPropertyNames(props).forEach((key) => {
      const prop = props[key]
      const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined
      result[prop.key] = transform(v, prop.typ, getProps, prop.key)
    })
    Object.getOwnPropertyNames(val).forEach((key) => {
      if (!Object.prototype.hasOwnProperty.call(props, key)) {
        result[key] = transform(val[key], additional, getProps, key)
      }
    })
    return result
  }

  if (typ === "any") return val
  if (typ === null) {
    if (val === null) return val
    return invalidValue(typ, val)
  }
  if (typ === false) return invalidValue(typ, val)
  while (typeof typ === "object" && typ.ref !== undefined) {
    typ = typeMap[typ.ref]
  }
  if (Array.isArray(typ)) return transformEnum(typ, val)
  if (typeof typ === "object") {
    return typ.hasOwnProperty("unionMembers")
      ? transformUnion(typ.unionMembers, val)
      : typ.hasOwnProperty("arrayItems")
      ? transformArray(typ.arrayItems, val)
      : typ.hasOwnProperty("props")
      ? transformObject(getProps(typ), typ.additional, val)
      : invalidValue(typ, val)
  }
  // Numbers can be parsed by Date but shouldn't be.
  if (typ === Date && typeof val !== "number") return transformDate(val)
  return transformPrimitive(typ, val)
}

function cast<T>(val: any, typ: any): T {
  return transform(val, typ, jsonToJSProps)
}

function uncast<T>(val: T, typ: any): any {
  return transform(val, typ, jsToJSONProps)
}

function a(typ: any) {
  return { arrayItems: typ }
}

function u(...typs: any[]) {
  return { unionMembers: typs }
}

function o(props: any[], additional: any) {
  return { props, additional }
}

function m(additional: any) {
  return { props: [], additional }
}

function r(name: string) {
  return { ref: name }
}

const typeMap: any = {
  CombinedModel: o(
    [
      { json: "aliases", js: "aliases", typ: m("any") },
      { json: "biases", js: "biases", typ: a(r("BiasModel")) },
      { json: "credibility", js: "credibility", typ: a(r("CredibilityModel")) },
      { json: "date", js: "date", typ: "" },
      { json: "questionable", js: "questionable", typ: a(r("QuestionableModel")) },
      { json: "reporting", js: "reporting", typ: a(r("ReportingModel")) },
      { json: "sources", js: "sources", typ: a(r("SiteModel")) },
      { json: "traffic", js: "traffic", typ: a(r("TrafficModel")) },
      { json: "version", js: "version", typ: 3.14 },
    ],
    "any",
  ),
  BiasModel: o(
    [
      { json: "bias", js: "bias", typ: r("BiasEnums") },
      { json: "code", js: "code", typ: r("BiasCodes") },
      { json: "description", js: "description", typ: "" },
      { json: "name", js: "name", typ: "" },
      { json: "pretty", js: "pretty", typ: "" },
      { json: "url", js: "url", typ: "" },
    ],
    "any",
  ),
  CredibilityModel: o(
    [
      { json: "code", js: "code", typ: r("CredibilityCodes") },
      { json: "credibility", js: "credibility", typ: r("CredibilityEnums") },
      { json: "name", js: "name", typ: "" },
      { json: "pretty", js: "pretty", typ: "" },
    ],
    "any",
  ),
  QuestionableModel: o(
    [
      { json: "code", js: "code", typ: r("QuestionableCodes") },
      { json: "name", js: "name", typ: "" },
      { json: "pretty", js: "pretty", typ: "" },
      { json: "questionable", js: "questionable", typ: r("QuestionableEnums") },
    ],
    "any",
  ),
  ReportingModel: o(
    [
      { json: "code", js: "code", typ: r("ReportingCodes") },
      { json: "name", js: "name", typ: "" },
      { json: "pretty", js: "pretty", typ: "" },
      { json: "reporting", js: "reporting", typ: r("ReportingEnums") },
    ],
    "any",
  ),
  SiteModel: o(
    [
      { json: "bias", js: "bias", typ: r("BiasEnums") },
      { json: "credibility", js: "credibility", typ: u(undefined, r("CredibilityEnums")) },
      { json: "domain", js: "domain", typ: "" },
      { json: "name", js: "name", typ: "" },
      { json: "popularity", js: "popularity", typ: u(undefined, 0) },
      { json: "questionable", js: "questionable", typ: a(r("QuestionableEnums")) },
      { json: "reporting", js: "reporting", typ: u(undefined, r("ReportingEnums")) },
      { json: "traffic", js: "traffic", typ: u(undefined, r("TrafficEnums")) },
      { json: "url", js: "url", typ: "" },
    ],
    "any",
  ),
  TrafficModel: o(
    [
      { json: "code", js: "code", typ: r("TrafficCodes") },
      { json: "name", js: "name", typ: "" },
      { json: "pretty", js: "pretty", typ: "" },
      { json: "traffic", js: "traffic", typ: r("TrafficEnums") },
    ],
    "any",
  ),
  BiasEnums: ["center", "conspiracy-pseudoscience", "fake-news", "left", "left-center", "pro-science", "right", "right-center", "satire"],
  BiasCodes: ["C", "CP", "FN", "L", "LC", "PS", "R", "RC", "S"],
  CredibilityCodes: ["H", "L", "M", "NA"],
  CredibilityEnums: ["high-credibility", "low-credibility", "medium-credibility", "n/a"],
  QuestionableCodes: ["C", "CEN", "FC", "FFC", "FN", "H", "IM", "LOT", "M", "NA", "P", "PG", "PS", "PSE"],
  QuestionableEnums: [
    "censorship",
    "conspiracy",
    "failed-fact-checks",
    "fake-news",
    "false-claims",
    "hate",
    "imposter",
    "lack-of-transparency",
    "misinformation",
    "n/a",
    "plagiarism",
    "poor-sourcing",
    "propaganda",
    "pseudoscience",
  ],
  ReportingCodes: ["H", "L", "M", "MF", "VH", "VL"],
  ReportingEnums: ["high", "low", "mixed", "mostly-factual", "very-high", "very-low"],
  TrafficEnums: ["high-traffic", "medium-traffic", "minimal-traffic", "no-data"],
  TrafficCodes: ["H", "L", "M", "N"],
}
