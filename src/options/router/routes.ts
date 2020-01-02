import Options from "./pages/options.vue";
import About from "./pages/about.vue";

export default [
  {
    name: "Options",
    path: "/",
    component: Options,
  },
  {
    name: "About",
    path: "/about",
    component: About,
    props: true,
  },
];
