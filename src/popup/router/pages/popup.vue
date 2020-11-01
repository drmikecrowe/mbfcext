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
            <div v-if="rated">
                <h1 class="p-0 pb-2">{{ bias }}</h1>
                <p class="text-sm">{{ biasDescription }}</p>
                <a :href="mbfcLink" target="_blank" class="pt-2">
                    Read the Media Bias/Fact Check detailed report&nbsp;
                    <font-awesome-icon icon="angle-double-right" size="lg" />
                </a>
            </div>
            <div v-else>
                <h1 class="p-0 pb-2">Not a rated site</h1>
                <p>
                    Feel free to view the full list of site rating and bias
                    analysis at the
                </p>
                <a
                    href="https://mediabiasfactcheck.com"
                    target="_blank"
                    class="pt-2"
                >
                    Media Bias/Fact Check Website &nbsp;
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
    biasShortToName,
    browser,
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
    rated = false;

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
        const [_cfg, sources, res] = await Promise.all([
            this.getConfig(),
            this.getSource(),
            getCurrentTab(),
        ]);
        const tab = res.isOk() ? res.value : null;
        if (!tab || !tab.url) {
            log(`Error: No tab returned`);
            return;
        }
        const parsed_domain = getSiteFromUrl(tab.url);
        if (parsed_domain.isErr()) {
            log(`Error: Can't parse domain`);
            return;
        }
        const { site } = parsed_domain.value;
        if (!site) {
            log(`Error: No site returned`);
            return;
        }
        const { name, description } = sources.biases[biasShortToName[site.b]];
        this.bias = name;
        this.biasDescription = description;
        this.mbfcLink = `https://mediabiasfactcheck.com/${site.u}`;
        this.rated = true;
    }
    async options() {
        browser.runtime.openOptionsPage();
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
