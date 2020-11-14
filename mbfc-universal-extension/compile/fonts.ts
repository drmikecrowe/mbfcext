import { writeFileSync } from "fs";

import { icon } from "@fortawesome/fontawesome-svg-core";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import { faEye } from "@fortawesome/free-regular-svg-icons";
import { faBook } from "@fortawesome/free-solid-svg-icons";
import { faAngleDoubleDown } from "@fortawesome/free-solid-svg-icons";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { faAngleDoubleRight } from "@fortawesome/free-solid-svg-icons";
import * as _ from "lodash";

let str = `import { m } from "malevic";

import { library, dom } from "@fortawesome/fontawesome-svg-core";
import { faCog as cog } from "@fortawesome/free-solid-svg-icons/faCog";
import { faEye as eye } from "@fortawesome/free-regular-svg-icons/faEye";
import { faBook as book } from "@fortawesome/free-solid-svg-icons/faBook";
import { faAngleDoubleDown as angleDoubleDown } from "@fortawesome/free-solid-svg-icons/faAngleDoubleDown";
import { faExternalLinkAlt as externalLinkAlt } from "@fortawesome/free-solid-svg-icons/faExternalLinkAlt";
import { faAngleDoubleRight as angleDoubleRight } from "@fortawesome/free-solid-svg-icons/faAngleDoubleRight";

library.add(cog, eye, book, angleDoubleDown, externalLinkAlt, angleDoubleRight);
dom.watch();

`;

str = `import { m } from "malevic";

`;

[
    faCog,
    faEye,
    faBook,
    faAngleDoubleDown,
    faExternalLinkAlt,
    faAngleDoubleRight,
].forEach((i) => {
    const t = icon(i);

    const name = `fa${_.upperFirst(_.camelCase(t.iconName))}`;
    str += `export const ${name} = '<img src="https://icongr.am/fontawesome/${t.iconName.replace(
        /-alt$/,
        ""
    )}.svg?size=16" alt="${name}" height="10px" />';

`;

    // const name = `fa${_.upperFirst(_.camelCase(t.iconName))}`;
    // const html = t.html
    //     .join("\n")
    //     .replace("<svg", "<svg height='26px' width='26px'");
    // str += `export const ${name} = (): Element => {
    // return (
    //     ${html}
    // );
    // }

    // `;
});
writeFileSync(`src/utils/elements/font-awesome.tsx`, str, "utf-8");
