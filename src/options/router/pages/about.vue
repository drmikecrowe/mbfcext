<template>
    <div class="container mx-auto text-base">
        <div v-html="rawHtml"></div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";

const AboutText = require("./markdown/About.md");

@Component
export default class About extends Vue {
    data() {
        return {
            rawHtml: AboutText,
        };
    }
}
</script>

<style></style>
