import ga4mp from "@analytics-debugger/ga4mp/dist/ga4mp.esm.js"

import { GA } from "~constants"
import { ConfigHandler, type ConfigStorage } from "~shared"
import { logger } from "~shared/logger"

const log = logger("mbfc:shared:google-analytics")

export class GoogleAnalytics {
  private static instance: GoogleAnalytics
  private config: ConfigStorage | undefined
  private ga4track: any

  static getInstance() {
    if (!GoogleAnalytics.instance) {
      const t = new GoogleAnalytics()
      try {
        t.ga4track = ga4mp([GA], {
          user_id: undefined,
          non_personalized_ads: true,
          debug: true,
        })
      } catch (error) {
        console.error(error)
      }
      GoogleAnalytics.instance = t
      log("GoogleAnalytics initialized")
    }
    return GoogleAnalytics.instance
  }

  private getConfig(): ConfigStorage | undefined {
    if (!this.config) this.config = ConfigHandler.getInstance().config
    return this.config
  }

  private allowed(): boolean {
    if (!this.ga4track) {
      log("Failed to initialize GA4MP")
      return false
    }
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
    this.ga4track.trackEvent("show-site", {
      event_category: "site",
      domain,
    })
  }

  reportCollapseSite(domain: string) {
    if (!this.allowed()) return

    this.ga4track.trackEvent("collapse-site", {
      event_category: "site",
      domain,
    })
  }

  reportUnknownSite(domain: string) {
    if (!this.allowed()) {
      log("Analytics not allowed")
      return
    }
    this.ga4track.trackEvent("unknown-site", {
      event_category: "site",
      domain,
    })
  }

  reportAssociateSite(domain: string, fb_url: string) {
    if (!this.allowed()) {
      log("Analytics not allowed")
      return
    }
    this.ga4track.trackEvent("associate-site", {
      event_category: "site",
      domain,
      fb_url,
    })
  }

  reportHidingSite(domain: string) {
    if (!this.allowed()) {
      log("Analytics not allowed")
      return
    }
    this.ga4track.trackEvent("hide-site", {
      event_category: "site",
      domain,
    })
  }

  reportUnhidingSite(domain: string) {
    if (!this.allowed()) {
      log("Analytics not allowed")
      return
    }
    this.ga4track.trackEvent("unhide-site", {
      event_category: "site",
      domain,
    })
  }

  reportResetIgnored() {
    if (!this.allowed()) {
      log("Analytics not allowed")
      return
    }
    this.ga4track.trackEvent("reset-ignored", {
      event_category: "extension",
    })
  }

  reportStartThanks() {
    if (!this.allowed()) {
      log("Analytics not allowed")
      return
    }
    this.ga4track.trackEvent("reset-ignored", {
      event_category: "extension",
    })
  }

  reportSponsoredHide() {
    if (!this.allowed()) {
      log("Analytics not allowed")
      return
    }
    this.ga4track.trackEvent("sponsored-hidden")
  }
}
