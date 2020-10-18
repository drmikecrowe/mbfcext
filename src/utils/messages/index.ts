import { AssociateSiteMessage } from "./AssociateSiteMessage";
import { GetConfigMessage } from "./GetConfigMessage";
import { HideSiteMessage } from "./HideSiteMessage";
import { ReportUnknownMessage } from "./ReportUnknownMessage";
import { ResetIgnoredMessage } from "./ResetIgnoredMessage";
import { ShowOptionsMessage } from "./ShowOptionsMessage";
import { ShowSiteMessage } from "./ShowSiteMessage";
import { StartThanksMessage } from "./StartThanksMessage";
import { UpdatedConfigMessage } from "./UpdatedConfigMessage";
import { UpdatedSourcesMessage } from "./UpdatedSourcesMessage";

export * from "./AssociateSiteMessage";
export * from "./common";
export * from "./GetConfigMessage";
export * from "./HideSiteMessage";
export * from "./messageUtil";
export * from "./ReportUnknownMessage";
export * from "./ResetIgnoredMessage";
export * from "./ShowOptionsMessage";
export * from "./ShowSiteMessage";
export * from "./StartThanksMessage";
export * from "./UpdatedConfigMessage";
export * from "./UpdatedSourcesMessage";

export type BrowserMessage =
    | AssociateSiteMessage
    | GetConfigMessage
    | HideSiteMessage
    | ReportUnknownMessage
    | ResetIgnoredMessage
    | ShowOptionsMessage
    | ShowSiteMessage
    | StartThanksMessage
    | UpdatedConfigMessage
    | UpdatedSourcesMessage;

export type HandleMessageCallback = (response: BrowserMessage) => void;
