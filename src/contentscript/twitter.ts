import { Twitter } from "contentscript/content/twitter";

import { ConfigHandler } from "utils/ConfigHandler";
import { isDevMode, logger } from "utils/logger";
import { GetConfigMessage } from "utils/messages/GetConfigMessage";
import { messageUtil } from "utils/messages/messageUtil";
import { UpdatedConfigMessage } from "utils/messages/UpdatedConfigMessage";
import { SourcesHandler } from "utils/SourcesHandler";

const log = logger("mbfc:contentscript:twitter");

(async () => {
  log(`Loaded into Twitter...`);
  messageUtil.receive(UpdatedConfigMessage.method, (p1, p2) => {
    log("Got message: ", p1, p2);
  });
  ConfigHandler.getInstance();
  SourcesHandler.getInstance();
  Twitter.getInstance();
  await new GetConfigMessage().sendMessage();
})().catch((err) => {
  console.error(err);
  if (isDevMode()) debugger;
});
