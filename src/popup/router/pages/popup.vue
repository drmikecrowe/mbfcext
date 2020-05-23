<template>
    <div class="container mx-auto p-2 centered">
        <div class="absolute top-0 right-0">
            <div class="p-1">
                <a href="#" @click="options" title="Configuration">
                    <font-awesome-icon class="float-right" icon="cog" />
                </a>
            </div>
        </div>

        <div class="clearfix"></div>
        <div class="pt-3">
            <div>
                <h1 class="p-6">Your Extension</h1>
                <router-link
                    :to="{ path: 'second', query: { id: 'some-id' } }"
                    class="px-3"
                    title="Second"
                >
                    Second Vue Page
                    <font-awesome-icon icon="angle-double-right" size="lg" />
                </router-link>
            </div>
        </div>
        <div class="p-2">
            <span
                class="absolute bottom-0 right-0 px-2 shadow font-sans text-xs"
            >
                As of: {{ lastRun | date }}
            </span>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import get from "lodash/get";
import { storage } from "utils";

import { library } from "@fortawesome/fontawesome-svg-core";
import { faAngleDoubleRight } from "@fortawesome/free-solid-svg-icons/faAngleDoubleRight";
import { faCog } from "@fortawesome/free-solid-svg-icons/faCog";

library.add(faAngleDoubleRight, faCog);

const log = require("debug")("mbfc:popup");

@Component
export default class Popup extends Vue {
    lastRun: number = 0;
    pollsPerDay: number = 0;
    polling: boolean = false;

    data() {
        this.updateData().then(() => {
            log(`Updated data`);
        });
        return {
            lastRun: 0,
        };
    }

    async updateData() {
        const lastRun = await storage.lastRun.get();
        if (lastRun) {
            this.lastRun = lastRun;
        }
    }
    async options() {
        chrome.runtime.openOptionsPage();
    }
}
</script>

<style lang="scss" scoped>
.centered {
    text-align: center;
}
</style>
