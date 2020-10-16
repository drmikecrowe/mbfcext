export {}
const log = require('debug')('mbfc:options:router:routes');
import Options from "./pages/options.vue";
import About from "./pages/about.vue";
import ReleaseNotes from "./pages/release-notes.vue";

export default [
    {
        name: "Options",
        path: "/",
        component: Options,
    },
    {
        name: "Release Notes",
        path: "/release-notes",
        component: ReleaseNotes,
        props: true,
    },
    {
        name: "About",
        path: "/about",
        component: About,
        props: true,
    },
];
