import { BiasEnums } from "./combined-manager"
import { logger } from "./logger"

const log = logger("mbfc:utils:ConfigHandler")

export type HiddenSites = Record<string, boolean>
export type UnknownSites = Record<string, boolean>

export enum CollapseKeys {
  collapseLeft = "collapseLeft",
  collapseLeftCenter = "collapseLeftCenter",
  collapseCenter = "collapseCenter",
  collapseRightCenter = "collapseRightCenter",
  collapseRight = "collapseRight",
  collapseProScience = "collapseProScience",
  collapseConspiracy = "collapseConspiracy",
  collapseSatire = "collapseSatire",
  collapseFakeNews = "collapseFakeNews",
  collapseMixed = "collapseMixed",
}

export interface Collapse {
  collapseLeft: boolean
  collapseLeftCenter: boolean
  collapseCenter: boolean
  collapseRightCenter: boolean
  collapseRight: boolean
  collapseProScience: boolean
  collapseConspiracy: boolean
  collapseSatire: boolean
  collapseFakeNews: boolean
  collapseMixed: boolean
}

export interface ConfigStorage {
  hiddenSites: HiddenSites
  unknown: UnknownSites
  lastRun: number
  firstrun: boolean
  loaded: boolean
  mbfcBlockAnalytics: boolean
  pollMinutes: number
}

export const DefaultCollapse: Collapse = {
  collapseLeft: false,
  collapseLeftCenter: false,
  collapseCenter: false,
  collapseRightCenter: false,
  collapseRight: false,
  collapseProScience: false,
  collapseConspiracy: true,
  collapseSatire: false,
  collapseFakeNews: true,
  collapseMixed: false,
}

export const OptionsToStorage: Record<never, BiasEnums & "M"> = {
  collapseLeft: BiasEnums.Left,
  collapseLeftCenter: BiasEnums.LeftCenter,
  collapseCenter: BiasEnums.Center,
  collapseRightCenter: BiasEnums.RightCenter,
  collapseRight: BiasEnums.Right,
  collapseProScience: BiasEnums.ProScience,
  collapseConspiracy: BiasEnums.ConspiracyPseudoscience,
  collapseSatire: BiasEnums.Satire,
  collapseFakeNews: BiasEnums.FakeNews,
  collapseMixed: "M",
}

export const StorageToOptions: Record<BiasEnums & "M", CollapseKeys> = {
  [BiasEnums.Left]: CollapseKeys.collapseLeft,
  [BiasEnums.LeftCenter]: CollapseKeys.collapseLeftCenter,
  [BiasEnums.Center]: CollapseKeys.collapseCenter,
  [BiasEnums.RightCenter]: CollapseKeys.collapseRightCenter,
  [BiasEnums.Right]: CollapseKeys.collapseRight,
  [BiasEnums.ProScience]: CollapseKeys.collapseProScience,
  [BiasEnums.ConspiracyPseudoscience]: CollapseKeys.collapseConspiracy,
  [BiasEnums.Satire]: CollapseKeys.collapseSatire,
  [BiasEnums.FakeNews]: CollapseKeys.collapseFakeNews,
  ["M"]: CollapseKeys.collapseMixed,
}

const configDefaults: ConfigStorage = {
  hiddenSites: {},
  unknown: {},
  lastRun: 0,
  firstrun: true,
  loaded: false,
  mbfcBlockAnalytics: false,
  pollMinutes: 60,
}

export class ConfigHandler {
  private static instance: ConfigHandler
  public config: ConfigStorage
  private loaded: boolean

  private constructor() {
    log(`Initializing ConfigHandler`)
    this.config = configDefaults
    this.loaded = false
  }

  static getInstance() {
    if (!ConfigHandler.instance) {
      ConfigHandler.instance = new ConfigHandler()
    }
    return ConfigHandler.instance
  }

  async persist(): Promise<ConfigStorage> {
    if (!this.config) return
    const storage = new Storage()
    for (const [k, v] of Object.entries(this.config)) {
      await storage.set(k, JSON.stringify(v))
    }
    return this.config
  }

  async retrieve(): Promise<ConfigStorage> {
    const storage = new Storage()
    const c: ConfigStorage = {
      hiddenSites: (await storage.get("hiddenSites")) || configDefaults.hiddenSites,
      unknown: (await storage.get("unknown")) || configDefaults.unknown,
      lastRun: (await storage.get("lastRun")) || configDefaults.lastRun,
      firstrun: (await storage.get("firstrun")) || configDefaults.firstrun,
      loaded: (await storage.get("loaded")) || configDefaults.loaded,
      mbfcBlockAnalytics: (await storage.get("mbfcBlockAnalytics")) || configDefaults.mbfcBlockAnalytics,
      pollMinutes: (await storage.get("pollMinutes")) || configDefaults.pollMinutes,
    }
    this.config = c
    return c
  }
}
