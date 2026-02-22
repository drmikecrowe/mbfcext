// import { logger } from "~utils";
// const log = logger("mbfc:utils:getDomain");

export const getDomain = (u: string) => {
  if (!u) return { domain: "", path: "" }
  let url = u.toLowerCase()
  let hn = ""
  let p = ""
  try {
    if (url.indexOf(".") > -1) {
      if (!url.startsWith("http")) url = `https://${url}`
      hn = new URL(url).hostname
      // eslint-disable-next-line prefer-destructuring
      if (hn) hn = hn.match(/(www[0-9]?\.)?(.+)/i)[2].toLowerCase()
      p = new URL(url).pathname.toLowerCase()
      if (p.indexOf("?") > -1) p = p.split("?").pop()
      if (p.endsWith("/")) p = p.slice(0, p.length - 1)
      if (p.startsWith("/")) p = p.slice(1)
    }
  } catch {
    // log(e);
    // invalid domain is normal
  }
  return { domain: hn, path: p }
}
