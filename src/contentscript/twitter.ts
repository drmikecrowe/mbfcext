import {
  ConfigHandler,
  GetConfigMessage,
  isDevMode,
  logger,
  messageUtil,
  SourcesHandler,
  UpdatedConfigMessage,
} from "utils";
import { Twitter } from "contentscript/content/twitter";

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
