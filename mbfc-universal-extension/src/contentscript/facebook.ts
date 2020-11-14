import {
    ConfigHandler,
    GetConfigMessage,
    isDevMode,
    logger,
    messageUtil,
    SourcesHandler,
    UpdatedConfigMessage,
} from "utils";
import { Facebook } from "contentscript/content/facebook";

const log = logger("mbfc:contentscript:facebook");

(async () => {
    log(`Loaded into Facebook...`);
    messageUtil.receive(UpdatedConfigMessage.method, (p1, p2) => {
        log("Got message: ", p1, p2);
    });
    ConfigHandler.getInstance();
    SourcesHandler.getInstance();
    Facebook.getInstance();
    await new GetConfigMessage().sendMessage();
})().catch((err) => {
    console.error(err);
    if (isDevMode()) debugger;
});
