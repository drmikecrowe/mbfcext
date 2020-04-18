export {}
const log = require('debug')('mbfc:setup:font-awesome');
import Vue from "vue";

// ** Include Font Awesome Icons here ** //
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

Vue.component("font-awesome-icon", FontAwesomeIcon);

import { library } from "@fortawesome/fontawesome-svg-core";
import { faCog } from "@fortawesome/free-solid-svg-icons";
library.add(faCog);