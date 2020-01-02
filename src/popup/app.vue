<template>
  <div class="popup">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
};
</script>

<style lang="scss" scoped>
body {
  width: 785px;
  height: 585px;
}

.popup {
  width: 785px;
  height: 585px;
}
</style>
