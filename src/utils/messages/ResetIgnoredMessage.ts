import { ConfigHandler, logger, messageUtil, StorageHandler } from "utils";

const log = logger("mbfc:messages:ResetIgnoredMessage");

export class ResetIgnoredMessage {
    static method = "ResetIgnoredMessageMethod";

    static listen() {
        messageUtil.receive(ResetIgnoredMessage.method, () => {
            try {
                const msg = new ResetIgnoredMessage();
                return msg.processMessage();
            } catch (err) {}
        });
    }

    async processMessage(): Promise<void> {
        log(`Processing ResetIgnoredMessage`);
        const _config = ConfigHandler.getInstance().config;
        if (_config.isErr()) return;
        const config = _config.value;
        config.hiddenSites = {};
        await StorageHandler.getInstance().update(config);
    }

    async sendMessage(toSelf = false): Promise<void> {
        if (toSelf) {
            messageUtil.sendSelf(ResetIgnoredMessage.method, {});
        }
        await messageUtil.send(ResetIgnoredMessage.method, {});
    }
}
