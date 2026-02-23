import { Storage } from "@plasmohq/storage"

import { BiasEnums } from "~models"
import { logger } from "~shared"

const log = logger("mbfc:utils:config-handler")

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
  collapseSponsored = "collapseSponsored",
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
  collapseSponsored: boolean
}

export interface ConfigStorage {
  collapse: Collapse
  hiddenSites: HiddenSites
  unknown: UnknownSites
  lastRun: number
  firstrun: boolean
  loaded: boolean
  mbfcBlockAnalytics: boolean
  disableNewsSearchButton: boolean
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
  collapseSponsored: false,
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
  collapseSponsored: "S",
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
  ["S"]: CollapseKeys.collapseSponsored,
}

const configDefaults: ConfigStorage = {
  collapse: DefaultCollapse,
  hiddenSites: {},
  unknown: {},
  lastRun: 0,
  firstrun: true,
  loaded: false,
  mbfcBlockAnalytics: false,
  disableNewsSearchButton: false,
  pollMinutes: 60,
}

export class ConfigHandler {
  private static instance: ConfigHandler

  retrievingPromise: Promise<ConfigStorage>
  config: ConfigStorage = configDefaults
  loaded = false
  loading = false

  static getInstance() {
    if (!ConfigHandler.instance) {
      ConfigHandler.instance = new ConfigHandler()
    }
    return ConfigHandler.instance
  }

  async persist(): Promise<ConfigStorage> {
    if (!this.config) return configDefaults

    const storage = new Storage()
    for (const [k, v] of Object.entries(this.config)) {
      await storage.set(k, JSON.stringify(v))
    }
    return this.config
  }

  async retrieve(): Promise<ConfigStorage> {
    if (this.loaded) return this.config
    if (!this.loading) {
      this.loading = true
      this.retrievingPromise = this.loadStorage()
    }
    return this.retrievingPromise
  }

  async getStorageRecord(key: string, dflt: any): Promise<any> {
    const storage = new Storage()
    const data = await storage.get(key)
    if (!data) return dflt
    try {
      return JSON.parse(data) as never
    } catch (e) {
      log(`Error parsing ${key} data: ${e}`)
      return dflt
    }
  }

  async loadStorage(): Promise<ConfigStorage> {
    const storage = new Storage()
    const col: Collapse = configDefaults.collapse
    for (const key of Object.keys(col)) {
      col[key] = (await storage.get(key)) || configDefaults.collapse[key]
      log(`Listening for changes in ${key}`)
      storage.watch({
        [key]: (s: any) => {
          this.config.collapse[key] = JSON.parse(s.newValue)
          log(`Collapse Key ${key} changed, updating to `, this.config.collapse[key])
        },
      })
    }
    const c: ConfigStorage = {
      collapse: col,
      hiddenSites: await this.getStorageRecord("hiddenSites", configDefaults.hiddenSites),
      unknown: await this.getStorageRecord("unknown", configDefaults.unknown),
      lastRun: await this.getStorageRecord("lastRun", configDefaults.lastRun),
      firstrun: await this.getStorageRecord("firstrun", configDefaults.firstrun),
      loaded: await this.getStorageRecord("loaded", configDefaults.loaded),
      mbfcBlockAnalytics: await this.getStorageRecord("mbfcBlockAnalytics", configDefaults.mbfcBlockAnalytics),
      disableNewsSearchButton: await this.getStorageRecord("disableNewsSearchButton", configDefaults.disableNewsSearchButton),
      pollMinutes: await this.getStorageRecord("pollMinutes", configDefaults.pollMinutes),
    }
    this.config = c
    Object.keys(c).forEach((key) => {
      log(`Listening for changes in ${key}`)
      storage.watch({
        [key]: (s: any) => {
          this.config[key] = JSON.parse(s.newValue)
          log(`Key ${key} changed, updating to `, this.config[key])
        },
      })
    })
    log(`Config loaded`, c)
    return c
  }
}
