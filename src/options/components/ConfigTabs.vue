<template>
  <ul class="flex border-b">
    <li v-for="(option, index) in routes" :key="index">
      <menu-item :option="option" :options="routes" />
    </li>
  </ul>
</template>

<script lang="ts">
import Vue from "vue";
import MenuItem from "./MenuItem.vue";

export default Vue.extend({
  props: {
    routes: {
      type: Array,
      required: true,
    },
  },
  components: {
    MenuItem,
  },
});
</script>

<style lang="scss" scoped></style>
