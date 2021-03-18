import { getDomain } from "utils/getDomain";
describe("getDomain", () => {
  it("should handle a standard domain", async function () {
    const { domain, path } = getDomain("https://domain.com");
    expect(domain).toEqual("domain.com");
    expect(path).toBeFalsy();
  });

  it("should handle a domain with http", async () => {
    const { domain, path } = getDomain("http://domain.com");
    expect(domain).toEqual("domain.com");
    expect(path).toBeFalsy();
  });

  it("should handle a domain without either", async () => {
    const { domain, path } = getDomain("domain.com");
    expect(domain).toEqual("domain.com");
    expect(path).toBeFalsy();
  });

  it("should handle a domain with a path", async () => {
    const { domain, path } = getDomain("https://domain.com/subdomain");
    expect(domain).toEqual("domain.com");
    expect(path).toEqual("/subdomain");
  });

  it("should handle a domain with a path", async () => {
    const { domain, path } = getDomain("https://domain.com/subdomain/multiple");
    expect(domain).toEqual("domain.com");
    expect(path).toEqual("/subdomain/multiple");
  });

  it("should handle a domain with a path and a query", async () => {
    const { domain, path } = getDomain(
      "https://domain.com/subdomain.php?query=1"
    );
    expect(domain).toEqual("domain.com");
    expect(path).toEqual("/subdomain.php");
  });

  it("should handle a domain with a trailing slash", async () => {
    const { domain, path } = getDomain("https://domain.com/subdomain/");
    expect(domain).toEqual("domain.com");
    expect(path).toEqual("/subdomain");
  });

  it("should handle a domain with a trailing slash and a query", async () => {
    const { domain, path } = getDomain("https://domain.com/subdomain/?query=1");
    expect(domain).toEqual("domain.com");
    expect(path).toEqual("/subdomain");
  });
});
