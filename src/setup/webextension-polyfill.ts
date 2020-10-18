import Vue from "vue";

(global as any).browser = require("webextension-polyfill-ts");

Vue.prototype.$browser = (global as any).browser;
