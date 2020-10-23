import {
    logger,
    messageUtil,
    UpdatedConfigMessage,
    UpdatedSourcesMessage,
} from "utils";
const log = logger("mbfc:messages:GetConfigMessage");

export class GetConfigMessage {
    static method = "GetConfigMessageMethod";
    public collapse;

    static listen() {
        messageUtil.receive(GetConfigMessage.method, () => {
            try {
                const msg = new GetConfigMessage();
                msg.processMessage();
            } catch (err) {}
        });

        return Promise.resolve();
    }

    async processMessage(): Promise<void> {
        log(`Processing GetConfigMessage`);
        await UpdatedConfigMessage.update();
        await UpdatedSourcesMessage.update();
    }

    async sendMessage(toSelf = false): Promise<void> {
        log(`Sending GetConfigMessage`);
        if (toSelf) {
            messageUtil.sendSelf(GetConfigMessage.method, {});
        }
        await messageUtil.send(GetConfigMessage.method, {});
    }
}
