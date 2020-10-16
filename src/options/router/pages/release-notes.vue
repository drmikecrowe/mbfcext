<template>
    <div class="container mx-auto text-base">
        <div v-html="rawHtml"></div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";

const ReleaseNotesText = require("./markdown/ReleaseNotes.md");

@Component
export default class ReleaseNotes extends Vue {
    data() {
        return {
            rawHtml: ReleaseNotesText,
        };
    }
}
</script>

<style>
p {
    margin-bottom: 10px;
}

h1 {
    margin-top: 15px;
    margin-bottom: 10px;
    font-weight: 900;
}

h2 {
    margin-top: 10px;
    margin-bottom: 10px;
    font-weight: 700;
}

h3 {
    margin-top: 10px;
    margin-bottom: 10px;
    font-weight: 600;
}
</style>
