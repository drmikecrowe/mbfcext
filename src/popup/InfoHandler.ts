import {
    biasShortToName,
    ConfigHandler,
    GetConfigMessage,
    getCurrentTab,
    getSiteFromUrl,
    IConfig,
    ISources,
    logger,
    messageUtil,
    SourcesHandler,
    UpdatedConfigMessage,
    UpdatedSourcesMessage,
} from "utils";

const log = logger("mbfc:popup:InfoHandler");
// const { log } = console;

export class InfoHandler {
    bias = "";

    biasDescription = "";

    mbfcLink = "";

    rated = false;

    private static instance: InfoHandler;

    static getInstance() {
        if (!InfoHandler.instance) {
            log("new instance");
            InfoHandler.instance = new InfoHandler();
        }
        return InfoHandler.instance;
    }

    static async getConfig(): Promise<IConfig> {
        return new Promise((resolve) => {
            log("Requesting config");
            messageUtil.receive(UpdatedConfigMessage.method, (cfg: IConfig) => {
                log(`New config received`);
                resolve(cfg);
            });
            new GetConfigMessage().sendMessage();
        });
    }

    static async getSource(): Promise<ISources> {
        return new Promise((resolve) => {
            messageUtil.receive(
                UpdatedSourcesMessage.method,
                (sources: ISources) => {
                    log(`New sources received`);
                    resolve(sources);
                }
            );
        });
    }

    async updateData() {
        ConfigHandler.getInstance();
        SourcesHandler.getInstance();
        const [_cfg, sources, res] = await Promise.all([
            InfoHandler.getConfig(),
            InfoHandler.getSource(),
            getCurrentTab(),
        ]);
        const tab = res.isOk() ? res.value : null;
        if (!tab || !tab.url) {
            log(`Error: No tab returned`);
            return;
        }
        const parsed_domain = getSiteFromUrl(tab.url);
        if (parsed_domain.isErr()) {
            log(`Error: Can't parse domain`);
            return;
        }
        const { site } = parsed_domain.value;
        if (!site) {
            log(`Error: No site returned`);
            return;
        }
        const { name, description } = sources.biases[biasShortToName[site.b]];
        this.bias = name;
        this.biasDescription = description;
        this.mbfcLink = `https://mediabiasfactcheck.com/${site.u}`;
        this.rated = true;
    }
}
