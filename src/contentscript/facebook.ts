import { Facebook } from "contentscript/content/facebook";
import { ConfigHandler } from "../utils/ConfigHandler";
import { logger, isDevMode } from "../utils/logger";
import { GetConfigMessage } from "../utils/messages/GetConfigMessage";
import { messageUtil } from "../utils/messages/messageUtil";
import { UpdatedConfigMessage } from "../utils/messages/UpdatedConfigMessage";
import { SourcesHandler } from "../utils/SourcesHandler";

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
