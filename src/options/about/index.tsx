import { m } from "malevic";

const AboutText = require("./About.md");

export const About = (): Element => {
    const parser = new DOMParser();
    const newNode = parser.parseFromString(AboutText, "text/html");

    return <div>{newNode.body.firstElementChild}</div>;
};
