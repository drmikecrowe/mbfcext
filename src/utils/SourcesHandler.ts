import { err, ok, Result } from "neverthrow";

import { ISources } from "utils/definitions";
import { logger } from "utils/logger";
import { messageUtil } from "utils/messages/messageUtil";
import { UpdatedSourcesMessage } from "utils/messages/UpdatedSourcesMessage";

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
