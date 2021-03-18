jest.mock("webext-options-sync");
jest.mock("utils/logger");
import { BaseSourcesProcessor } from "background/BaseSourcesProcessor";
import { ISources } from "utils/definitions";

(global as any).browser.runtime.getManifest = jest.fn(() => {
  return {};
});

describe("BaseSourcesProcessor", () => {
  let srcs: ISources;
  let bsp: BaseSourcesProcessor;

  beforeAll(async () => {
    const combined: any = require("../../../docs/v3/combined.json");
    bsp = new BaseSourcesProcessor();
    bsp.initializeCombined(combined);
    srcs = bsp.sources;
  });

  it("should find multiple subdomains for cato.org", async () => {
    expect(Object.keys(srcs.subdomains).length).toBeGreaterThan(6);
    expect(Object.keys(srcs.subdomains["cato.org"]).length).toBeGreaterThan(1);
  });
});
