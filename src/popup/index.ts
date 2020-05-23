export {};
const log = require("debug")("mbfc:popup:index");

import Vue from "vue";

require("utils/config/webextension-polyfill");
require("utils/config/config");
require("utils/config/font-awesome");
require("utils/config/filters");
require("tailwind");

if (process.env.NODE_ENV === "development" && process.env.DEVTOOLS) {
    const devtools = require("@vue/devtools");
    devtools.connect();
}

// ** Start Vue here ** //
import App from "./app.vue";
import router from "./router";
Vue.component("app", App);
new Vue({
    el: "#app",
    router,
    render: (h) => h(App),
});
