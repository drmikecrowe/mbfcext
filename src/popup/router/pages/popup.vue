<template>
    <div class="container mx-auto p-2 centered">
        <div class="absolute top-0 right-0">
            <div class="p-1">
                <a href="#" title="Configuration" @click="options">
                    <font-awesome-icon class="float-right" icon="cog" />
                </a>
            </div>
        </div>

        <div class="clearfix"></div>
        <div class="pt-3">
            <div>
                <h1 class="p-0 pb-2">{{ bias }}</h1>
                <p>{{ biasDescription }}</p>
                <a :href="mbfcLink" target="_blank" class="pt-2">
                    Read the Media Bias/Fact Check detailed report&nbsp;
                    <font-awesome-icon icon="angle-double-right" size="lg" />
                </a>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import get from "lodash/get";
import {
    biasNameToShort,
    ConfigHandler,
    GetConfigMessage,
    getCurrentTab,
    getSiteFromUrl,
    IConfig,
    ISources,
    logger,
    messageUtil,
    SourcesHandler,
    UpdatedConfigMessage,
    UpdatedSourcesMessage,
} from "utils";

import { library } from "@fortawesome/fontawesome-svg-core";
import { faAngleDoubleRight } from "@fortawesome/free-solid-svg-icons/faAngleDoubleRight";
import { faCog } from "@fortawesome/free-solid-svg-icons/faCog";

library.add(faAngleDoubleRight, faCog);

const log = logger("mbfc:vue:popup");

@Component
export default class Popup extends Vue {
    bias = "";
    biasDescription = "";
    mbfcLink = "";

    data() {
        this.updateData().then(() => {
            log(`Updated data`);
        });
        return {
            lastRunDate: "",
        };
    }

    async getConfig(): Promise<IConfig> {
        return new Promise((resolve) => {
            messageUtil.receive(UpdatedConfigMessage.method, (cfg: IConfig) => {
                log(`New config received`);
                resolve(cfg);
            });
            new GetConfigMessage().sendMessage();
        });
    }

    async getSource(): Promise<ISources> {
        return new Promise((resolve) => {
            messageUtil.receive(
                UpdatedSourcesMessage.method,
                (sources: ISources) => {
                    log(`New sources received`);
                    resolve(sources);
                }
            );
        });
    }

    async updateData() {
        ConfigHandler.getInstance();
        SourcesHandler.getInstance();
        const [cfg, sources, tab] = await Promise.all([
            this.getConfig(),
            this.getSource(),
            getCurrentTab(),
        ]);
        if (!tab || !tab.url) return;
        const parsed_domain = getSiteFromUrl(tab.url);
        if (parsed_domain.isErr()) return false;
        const { site } = parsed_domain.value;
        if (!site) return;
        const { name, description, url } = sources.biases[
            biasNameToShort[site.b]
        ];
        this.bias = name;
        this.biasDescription = description;
        this.mbfcLink = `https://mediabiasfactcheck.com/${site.u}`;
    }
    async options() {
        // browser.runtime.openOptionsPage();
        await this.updateData();
    }
}
</script>

<style lang="scss" scoped>
h1 {
    margin-top: 0;
}

#factual {
    font-weight: bold;
}

center-text {
    text-align: center !important;
}

h1 > a {
    text-decoration: none;
}
</style>
