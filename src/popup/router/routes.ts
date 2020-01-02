import Popup from "./pages/popup.vue";
import Second from "./pages/second.vue";

export default [
  {
    name: "popup",
    path: "/",
    component: Popup,
  },
  {
    name: "second",
    path: "/second",
    component: Second,
    props: true,
  },
];
