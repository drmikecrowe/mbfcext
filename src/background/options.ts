export {};
const log = require("debug")("mbfc:background:options");

import OptionsSync from "webext-options-sync";

const optionsStorage = new OptionsSync();

export class OptionsProcessor {
  private static instance: OptionsProcessor;
  private constructor() {
    // do something construct...
  }
  static getInstance() {
    if (!OptionsProcessor.instance) {
      OptionsProcessor.instance = new OptionsProcessor();
      // ... any one time initialization goes here ...
    }
    return OptionsProcessor.instance;
  }
  async getOptions() {
    return await optionsStorage.getAll();
  }
}
