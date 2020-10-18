import { isDevMode, logger, messageUtil, UpdatedConfigMessage } from "utils";

const log = logger("mbfc:contentscript:facebook");

(async () => {
    log(`Loaded into Facebook...`);
    messageUtil.receive(UpdatedConfigMessage.method, (p1, p2) => {
        log("Got message: ", p1, p2);
    });
})().catch((err) => {
    console.error(err);
    if (isDevMode()) debugger;
});
