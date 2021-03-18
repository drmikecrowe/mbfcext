jest.mock("webext-options-sync");
jest.mock("utils/logger");
jest.mock("utils/StorageHandler");
jest.mock("utils/SourcesHandler");
jest.mock("utils/ConfigHandler");

(global as any).browser.runtime.getManifest = jest.fn(() => {
  return {};
});

import { checkDomain } from "utils/checkDomain";

describe("checkDomain", () => {
  it("should handle standard domain", () => {
    const res = checkDomain("cnn.com", "/breaking/something");
    if (res.isErr()) console.error(res.error);
    expect(res.isOk()).toBeTruthy();
    if (res.isOk()) {
      expect(res.value).toHaveProperty("final_domain", "cnn.com");
      expect(res.value).toHaveProperty("site.d", "cnn.com");
    }
  });

  it("should handle nhk.or.jp/nhkworld", () => {
    const res = checkDomain("nhk.or.jp", "/nhkworld");
    if (res.isErr()) console.error(res.error);
    expect(res.isOk()).toBeTruthy();
    if (res.isOk()) {
      expect(res.value).toHaveProperty("final_domain", "nhk.or.jp/nhkworld");
      expect(res.value).toHaveProperty("site.d", "nhk.or.jp/nhkworld");
    }
  });

  it("should handle nhk.or.jp/nhkworld/article1/date", () => {
    const res = checkDomain("nhk.or.jp", "/nhkworld/article1/date");
    if (res.isErr()) console.error(res.error);
    expect(res.isOk()).toBeTruthy();
    if (res.isOk()) {
      expect(res.value).toHaveProperty("final_domain", "nhk.or.jp/nhkworld");
      expect(res.value).toHaveProperty("site.d", "nhk.or.jp/nhkworld");
    }
  });
});
