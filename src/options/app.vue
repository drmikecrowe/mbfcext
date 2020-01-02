<template>
  <div class="container config mx-auto justify-center items-center">
    <h1 class="text-2xl text-center p-4">Extension Options</h1>
    <config-tabs :routes="routes" />
    <div class="w-full">
      <div class="bg-white shadow-lg rounded flex flex-col px-8 pt-6 pb-8">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import ConfigTabs from "./components/ConfigTabs.vue";
import routes from "./router/routes";

export default {
  data() {
    return {
      routes,
    };
  },
  components: {
    "config-tabs": ConfigTabs,
  },
};
</script>

<style lang="scss">
.config {
  width: 800px;
}
</style>
