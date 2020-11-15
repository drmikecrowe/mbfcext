import { m } from "malevic";

const IntroContents = require("./intro.md");

const kids = (e: Element): Element[] => {
  const nodes: Element[] = [];
  const topNode = e.querySelector("body") || e.tagName === "BODY" ? e : null;
  if (topNode) {
    topNode.childNodes.forEach((e2) => nodes.push(e2 as Element));
  } else {
    nodes.push(e);
  }
  return nodes;
};

export const Intro = (): Element => {
  const parser = new DOMParser();
  const newNode = parser.parseFromString(IntroContents, "text/html");
  const nodes = kids(newNode.body);
  return <div>{...nodes}</div>;
};
