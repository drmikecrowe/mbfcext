import { icon, library, dom } from "@fortawesome/fontawesome-svg-core";
import { faCog } from "@fortawesome/free-solid-svg-icons/faCog";
import { faEye } from "@fortawesome/free-regular-svg-icons/faEye";
import { faBook } from "@fortawesome/free-solid-svg-icons/faBook";
import { faAngleDoubleDown } from "@fortawesome/free-solid-svg-icons/faAngleDoubleDown";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons/faExternalLinkAlt";
import { faAngleDoubleRight } from "@fortawesome/free-solid-svg-icons/faAngleDoubleRight";

library.add(
    faCog,
    faEye,
    faBook,
    faAngleDoubleDown,
    faExternalLinkAlt,
    faAngleDoubleRight
);
dom.watch();

export {
    icon,
    faCog,
    faEye,
    faBook,
    faAngleDoubleDown,
    faExternalLinkAlt,
    faAngleDoubleRight,
};
