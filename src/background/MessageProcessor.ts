import { logger } from "utils/logger";
import { AssociateSiteMessage } from "utils/messages/AssociateSiteMessage";
import { GetConfigMessage } from "utils/messages/GetConfigMessage";
import { HideSiteMessage } from "utils/messages/HideSiteMessage";
import { ReportUnknownMessage } from "utils/messages/ReportUnknownMessage";
import { ResetIgnoredMessage } from "utils/messages/ResetIgnoredMessage";
import { ShowOptionsMessage } from "utils/messages/ShowOptionsMessage";
import { ShowSiteMessage } from "utils/messages/ShowSiteMessage";
import { StartThanksMessage } from "utils/messages/StartThanksMessage";

const log = logger("mbfc:background:messages");

export class MessageProcessor {
  private static instance: MessageProcessor;

  static getInstance(): MessageProcessor {
    if (!MessageProcessor.instance) {
      MessageProcessor.instance = new MessageProcessor();
      log("MessageProcessor initialized");

      AssociateSiteMessage.listen();
      GetConfigMessage.listen();
      HideSiteMessage.listen();
      ReportUnknownMessage.listen();
      ResetIgnoredMessage.listen();
      ShowOptionsMessage.listen();
      ShowSiteMessage.listen();
      StartThanksMessage.listen();
    }
    return MessageProcessor.instance;
  }
}
