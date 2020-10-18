import {
    ConfigHandler,
    GetConfigMessage,
    isDevMode,
    logger,
    messageUtil,
    SourcesHandler,
    UpdatedConfigMessage,
} from "utils";

const log = logger("mbfc:contentscript:facebook");

(async () => {
    log(`Loaded into Facebook...`);
    new GetConfigMessage().sendMessage();
    messageUtil.receive(UpdatedConfigMessage.method, (p1, p2) => {
        log("Got message: ", p1, p2);
    });
    ConfigHandler.getInstance();
    SourcesHandler.getInstance();
})().catch((err) => {
    console.error(err);
    if (isDevMode()) debugger;
});
