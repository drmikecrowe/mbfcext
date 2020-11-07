import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { icon, library, dom } from "@fortawesome/fontawesome-svg-core";
import { faCog } from "@fortawesome/free-solid-svg-icons/faCog";
import { faEye } from "@fortawesome/free-regular-svg-icons/faEye";
import { faAngleDoubleDown } from "@fortawesome/free-solid-svg-icons/faAngleDoubleDown";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons/faExternalLinkAlt";
import { faAngleDoubleRight } from "@fortawesome/free-solid-svg-icons/faAngleDoubleRight";

library.add(
    faCog,
    faEye,
    faAngleDoubleDown,
    faExternalLinkAlt,
    faAngleDoubleRight
);
dom.watch();

export {
    icon,
    faCog,
    faEye,
    faAngleDoubleDown,
    faExternalLinkAlt,
    faAngleDoubleRight,
    FontAwesomeIcon,
};
