import { err, ok, Result } from "neverthrow";
import { ISources, logger } from "utils";
import { messageUtil, UpdatedSourcesMessage } from "./messages";

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
