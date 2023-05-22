import GoogleTagManager from "gtm-module"

import { GTM } from "~constants"
import { ConfigHandler, type ConfigStorage } from "~shared"
import { logger } from "~shared/logger"

const log = logger("mbfc:utils:google-analytics")

export class GoogleAnalytics {
  private static instance: GoogleAnalytics
  private gtm: GoogleTagManager | undefined
  private config: ConfigStorage | undefined

  static getInstance() {
    if (!GoogleAnalytics.instance) {
      GoogleAnalytics.instance = new GoogleAnalytics()
      log("GoogleAnalytics initialized")
      const gtmConfig = {
        gtmId: GTM, // required
        sanitizeDataLayerObjects: true, // optional
        defer: true, // optional
      }
      GoogleAnalytics.instance.gtm = new GoogleTagManager(gtmConfig)
    }
    return GoogleAnalytics.instance
  }

  private getConfig(): ConfigStorage | undefined {
    if (!this.config) this.config = ConfigHandler.getInstance().config
    return this.config
  }

  private allowed(): boolean {
    const config = this.getConfig()
    if (config) return !config.mbfcBlockAnalytics
    return false
  }

  reportShowSite(domain: string) {
    if (!this.allowed()) {
      log("Analytics not allowed")
      return
    }
    log(`Reporting show site ${domain}`)
    this.gtm.dataLayerPush({
      event: "show-site",
      domain,
    })
  }

  reportCollapseSite(domain: string) {
    if (!this.allowed()) return

    this.gtm.dataLayerPush({
      event: "collapse-site",
      domain,
    })
  }

  reportUnknownSite(domain: string) {
    if (!this.allowed()) {
      log("Analytics not allowed")
      return
    }
    console.log("TODO: reportUnknownSite")
  }

  reportAssociateSite(domain: string, fb_url: string) {
    if (!this.allowed()) {
      log("Analytics not allowed")
      return
    }
    console.log("TODO: reportAssociateSite")
  }

  reportHidingSite(domain: string) {
    if (!this.allowed()) {
      log("Analytics not allowed")
      return
    }
    console.log("TODO: reportHidingSite")
  }

  reportUnhidingSite(domain: string) {
    if (!this.allowed()) {
      log("Analytics not allowed")
      return
    }
    console.log("TODO: reportUnhidingSite")
  }

  reportResetIgnored() {
    if (!this.allowed()) {
      log("Analytics not allowed")
      return
    }
    console.log("TODO: reportResetIgnored")
  }

  reportStartThanks() {
    if (!this.allowed()) {
      log("Analytics not allowed")
      return
    }
    console.log("TODO: reportStartThanks")
  }
}
