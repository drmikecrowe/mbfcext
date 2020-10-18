import {
    AssociateSiteMessage,
    GetConfigMessage,
    HideSiteMessage,
    logger,
    ReportUnknownMessage,
    ResetIgnoredMessage,
    ShowOptionsMessage,
    ShowSiteMessage,
    StartThanksMessage,
} from "utils";
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
