import { browser, checkDomain, getDomain, logger } from "utils";
import { getCurrentTab, getSiteFromUrl } from "utils/tabUtils";
const log = logger("mbfc:background:TabListener");

const colorMap = {
    L: { color: "white", backColor: "#0a44ff" },
    LC: { color: "black", backColor: "#94adff" },
    C: { color: "black", backColor: "white" },
    RC: { color: "black", backColor: "#ffb4b5" },
    R: { color: "white", backColor: "#ff171c" },
    PS: { color: "white", backColor: "green" },
    S: { color: "white", backColor: "green" },
    Q: { color: "black", backColor: "yellow" },
    CP: { color: "black", backColor: "yellow" },
};

export class TabListener {
    private static instance: TabListener;
    private interval: number | undefined;

    constructor() {
        log(`Initializing onUpdated for tab listener`);
        const badgeUpdater = () => this.updateBadge();
        browser.tabs.onActivated.addListener(badgeUpdater);
        browser.tabs.onUpdated.addListener(badgeUpdater);
    }

    static async getInstance() {
        if (!TabListener.instance) {
            TabListener.instance = new TabListener();
        }
        return TabListener.instance;
    }

    static draw(text, color, backColor) {
        const canvas = document.createElement("canvas"); // Create the canvas
        canvas.width = 19;
        canvas.height = 19;
        let left = 10;

        const context = canvas.getContext("2d");
        if (!context) return;
        if (backColor === "white") {
            context.fillStyle = color;
            context.fillRect(0, 0, 19, 19);
            context.fillStyle = backColor;
            context.fillRect(1, 1, 17, 17);
            left -= 1;
        } else {
            context.fillStyle = backColor;
            context.fillRect(0, 0, 19, 19);
        }

        context.fillStyle = color;
        context.textAlign = "center";
        context.textBaseline = "top";
        context.font = "bold 14 px serif";
        context.fillText(text, left, 5);
        return context.getImageData(0, 0, 19, 19);
    }

    static show(icon: string, inverse: boolean) {
        const color = inverse ? colorMap[icon].backColor : colorMap[icon].color;
        const backColor = !inverse
            ? colorMap[icon].backColor
            : colorMap[icon].color;
        log(`Showing icon ${icon}`);
        browser.browserAction.setIcon({
            imageData: TabListener.draw(icon, color, backColor),
        });
    }

    updateTab(tab: any): boolean {
        const parsed_domain = getSiteFromUrl(tab.url);
        if (parsed_domain.isErr()) return false;
        const { site, collapse } = parsed_domain.value;
        if (site && site.b) {
            const icon = site.b;
            if (!colorMap[site.b]) {
                log(`No colorMap for icon ${site.b} from `, site);
                return false;
            }
            let inverse = false;
            TabListener.show(icon, inverse);
            if (collapse) {
                log(`Icon: ${icon}, flashing`, parsed_domain);
                this.interval = setInterval(() => {
                    inverse = !inverse;
                    TabListener.show(icon, inverse);
                }, 1000) as any;
            } else {
                log(`Icon: ${icon}`, parsed_domain);
            }
            return true;
        } else {
        }
        return false;
    }

    public async updateBadge() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = 0;
        }
        const tab = await getCurrentTab();
        if (tab && tab.url && !tab.incognito) {
            if (!this.updateTab(tab)) {
                browser.browserAction.setIcon({
                    path: "icons/icon48.png",
                });
            }
        }
    }
}
