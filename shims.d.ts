import { ProtocolWithReturn } from "webext-bridge"

import type { SiteModel } from "~utils/combined-manager"

import { CheckDomainResults } from "./src/utils/check-domain"

declare module "webext-bridge" {
  export interface ProtocolMap {
    "check-domain": ProtocolWithReturn<{ domain: string; path: string }, CheckDomainResults>
    "get-domain": ProtocolWithReturn<{ domain: string }, SiteModel | undefined>,
    "get-domain-for-tab": ProtocolWithReturn<{ domain: string, path?: string }, PopupDetails | undefined>
  }
}
