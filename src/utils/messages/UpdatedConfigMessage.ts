import { ConfigHandler, IConfig, logger, messageUtil } from "utils";
const log = logger("mbfc:messages:UpdatedConfigMessage");

export class UpdatedConfigMessage {
    static method = "UpdatedConfigMessageMethod";
    public config: IConfig;

    constructor(config: IConfig) {
        this.config = config;
    }

    static async update(): Promise<void> {
        const _config = ConfigHandler.getInstance().config;
        if (_config.isErr()) return;
        const cfg = _config.value;
        const msg = new UpdatedConfigMessage(cfg);
        await msg.sendMessage(true);
    }

    async sendMessage(toSelf = false): Promise<void> {
        log(`Sending UpdatedConfigMessage `, this.config);
        if (toSelf) {
            messageUtil.sendSelf(UpdatedConfigMessage.method, this.config);
        }
        await messageUtil.send(UpdatedConfigMessage.method, this.config);
    }
}
