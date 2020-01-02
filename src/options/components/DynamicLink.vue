// https://github.com/johndatserakis/vue-navigation-bar/blob/master/src/components/DynamicLink.vue
<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  name: "dynamic-link",
  render: function(h) {
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
      this.$slots.default,
    );
  },
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
});
</script>
