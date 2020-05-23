import { AssociateSiteMessage } from "./AssociateSiteMessage";
import { GetConfigMessage } from "./GetConfigMessage";
import { HideSiteMessage } from "./HideSiteMessage";
import { ReloadConfigMessage } from "./ReloadConfigMessage";
import { ReportUnknownMessage } from "./ReportUnknownMessage";
import { ResetIgnoredMessage } from "./ResetIgnoredMessage";
import { ShowOptionsMessage } from "./ShowOptionsMessage";
import { ShowSiteMessage } from "./ShowSiteMessage";
import { StartThanksMessage } from "./StartThanksMessage";
import { UpdatedConfigMessage } from "./UpdatedConfigMessage";

export * from "./AssociateSiteMessage";
export * from "./GetConfigMessage";
export * from "./HideSiteMessage";
export * from "./ReloadConfigMessage";
export * from "./ReportUnknownMessage";
export * from "./ResetIgnoredMessage";
export * from "./ShowOptionsMessage";
export * from "./ShowSiteMessage";
export * from "./StartThanksMessage";
export * from "./UpdatedConfigMessage";
export * from "./common";

export type BrowserMessage =
    | AssociateSiteMessage
    | GetConfigMessage
    | HideSiteMessage
    | ReloadConfigMessage
    | ReportUnknownMessage
    | ResetIgnoredMessage
    | ShowOptionsMessage
    | ShowSiteMessage
    | StartThanksMessage
    | UpdatedConfigMessage;

export type HandleMessageCallback = (response: BrowserMessage) => void;
