export {};
const log = require("debug")("mbfc:options:index");

import Vue from "vue";

require("setup/webextension-polyfill");
require("setup/config");
require("setup/font-awesome");
require("setup/filters");
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
