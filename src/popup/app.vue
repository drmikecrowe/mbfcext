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
    width: 400px;
    height: 200px;
}

.popup {
    width: 400px;
    height: 200px;
}
</style>
