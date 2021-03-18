import { err, ok, Result } from "neverthrow";

import { ISources } from "./definitions";
import { logger } from "./logger";
import { messageUtil } from "./messages/messageUtil";
import { UpdatedSourcesMessage } from "./messages/UpdatedSourcesMessage";

const log = logger("mbfc:utils:SourcesHandler");

export class SourcesHandler {
  private static instance: SourcesHandler;
  public sources: Result<ISources, null>;

  private constructor() {
    log(`Initializing SourcesHandler`);
    this.sources = err(null);
    messageUtil.receive(UpdatedSourcesMessage.method, (cfg: ISources) => {
      log(`New sources received`);
      this.sources = ok(cfg);
    });
  }

  static getInstance() {
    if (!SourcesHandler.instance) {
      SourcesHandler.instance = new SourcesHandler();
    }
    return SourcesHandler.instance;
  }
}
