export {}
const log = require('debug')('mbfc:popup:router:index');
import Vue from "vue";
import VueRouter from "vue-router";
import routes from "./routes";

Vue.use(VueRouter);

export default new VueRouter({
  base: "/",
  mode: "hash",
  routes,
});
