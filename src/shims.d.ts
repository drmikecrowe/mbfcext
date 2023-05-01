/// <reference types="react-scripts" />

import { ProtocolWithReturn } from "webext-bridge"

import type { SiteModel } from "~models/combined-manager"

import { CheckDomainResults } from "./src/background/utils/check-domain"

declare module "webext-bridge" {
  export interface ProtocolMap {
    "get-domain-for-tab": ProtocolWithReturn<{ domain: string; path?: string }, PopupDetails | undefined>
    "updated-config": ProtocolWithReturn<null, ConfigStorage>
    "updated-sources": ProtocolWithReturn<null, SourceData>
    "hide-site": ProtocolWithReturn<{ domain: string; collapse: boolean }, void>
    "show-site": ProtocolWithReturn<{ domain: string; isAlias: boolean; isBase: boolean; isCollapsed: boolean }, void>
    "unknown-site": ProtocolWithReturn<{ domain: string }, never>
    "associate-site": ProtocolWithReturn<{ new_domain: string; domain: string }, never>
    "reset-ignored": ProtocolWithReturn<{}, never>
    "start-thanks": ProtocolWithReturn<{}, never>
  }
}
