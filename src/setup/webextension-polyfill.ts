// @ts-nocheck
import Vue from "vue";

global.browser = require("webextension-polyfill");

Vue.prototype.$browser = global.browser;
