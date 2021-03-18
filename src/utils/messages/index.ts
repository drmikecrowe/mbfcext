import { AssociateSiteMessage } from "utils/messages/AssociateSiteMessage";
import { GetConfigMessage } from "utils/messages/GetConfigMessage";
import { HideSiteMessage } from "utils/messages/HideSiteMessage";
import { ReportUnknownMessage } from "utils/messages/ReportUnknownMessage";
import { ResetIgnoredMessage } from "utils/messages/ResetIgnoredMessage";
import { ShowOptionsMessage } from "utils/messages/ShowOptionsMessage";
import { ShowSiteMessage } from "utils/messages/ShowSiteMessage";
import { StartThanksMessage } from "utils/messages/StartThanksMessage";
import { UpdatedConfigMessage } from "utils/messages/UpdatedConfigMessage";
import { UpdatedSourcesMessage } from "utils/messages/UpdatedSourcesMessage";

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
