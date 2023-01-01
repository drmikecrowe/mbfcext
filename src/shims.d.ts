/// <reference types="react-scripts" />

import { ProtocolWithReturn } from "webext-bridge"

import type { SiteModel } from "~models/combined-manager"

import { CheckDomainResults } from "./src/background/utils/check-domain"

declare module "webext-bridge" {
  export interface ProtocolMap {
    "check-domain": ProtocolWithReturn<{ domain: string; path: string }, CheckDomainResults>
    "get-domain-for-tab": ProtocolWithReturn<{ domain: string; path?: string }, PopupDetails | undefined>
  }
}

