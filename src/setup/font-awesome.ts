import Vue from "vue";

// ** Include Font Awesome Icons here ** //
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

Vue.component("FontAwesomeIcon", FontAwesomeIcon);

import { library } from "@fortawesome/fontawesome-svg-core";
import { faCog } from "@fortawesome/free-solid-svg-icons/faCog";
library.add(faCog);
