import { Result, ok } from "neverthrow";
import { ISources } from "utils/definitions";
import { BaseSourcesProcessor } from "background/BaseSourcesProcessor";

export class SourcesHandler {
  private static instance: SourcesHandler;
  public sources: Result<ISources, null>;
  private bsp: BaseSourcesProcessor;

  private constructor() {
    const combined: any = require("utils/../../docs/v3/combined.json");
    this.bsp = new BaseSourcesProcessor();
    this.bsp.initializeCombined(combined);
    this.sources = ok(this.bsp.sources);
  }
  static getInstance() {
    if (!SourcesHandler.instance) {
      SourcesHandler.instance = new SourcesHandler();
      // ... any one time initialization goes here ...
    }
    return SourcesHandler.instance;
  }
  //someMethod() { }
}
