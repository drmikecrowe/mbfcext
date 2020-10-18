import { ISources, messageUtil } from "..";
import { logger } from "utils";
const log = logger("mbfc:messages:UpdatedSourcesMessage");

import { SourcesProcessor } from "background/SourcesProcessor";

export class UpdatedSourcesMessage {
    static method = "UpdatedSourcesMessageMethod";
    public sources: ISources;

    constructor(sources: ISources) {
        this.sources = sources;
    }

    static async update(): Promise<void> {
        const src = await SourcesProcessor.getInstance().getSources();
        log(`Sending UpdatedSourcesMessage`);
        const msg = new UpdatedSourcesMessage(src);
        await msg.sendMessage(true);
    }

    async sendMessage(toSelf = false): Promise<void> {
        log("Sending UpdatedSourcesMessage ", this.sources);
        if (toSelf) {
            messageUtil.sendSelf(UpdatedSourcesMessage.method, this.sources);
        }
        messageUtil.send(UpdatedSourcesMessage.method, this.sources);
    }
}
