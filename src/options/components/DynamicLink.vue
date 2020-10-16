<script lang="ts">
// https://github.com/johndatserakis/vue-navigation-bar/blob/master/src/components/DynamicLink.vue
import Vue from "vue";
export default Vue.extend({
    name: "DynamicLink",
    props: {
        isExternalLink: {
            type: Boolean,
            required: false,
        },
        path: {
            type: String,
            required: true,
        },
    },
    render: function (h) {
        if (this.isExternalLink) {
            return h("a", { attrs: { href: this.path } }, this.$slots.default);
        }
        return h(
            "router-link",
            {
                props: {
                    to: { path: this.path },
                },
            },
            this.$slots.default
        );
    },
});
</script>
