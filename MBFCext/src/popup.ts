import { TabListener } from "./utils/tabListener";
import { IConfig } from "./utils/definitions";
import { GetConfigMessage } from "./messages";
import { getCurrentTab } from "./utils/getCurrentTab";

async function getConfig() {
    const config: IConfig = await GetConfigMessage.SendMessage();
    return config;
}

document.addEventListener("DOMContentLoaded", async function() {
    const tabListener = TabListener.getInstance(await getConfig());
    document.body.style.display = "none";

    document.querySelectorAll("a[href]").forEach(function(el) {
        el.addEventListener("click", function(event) {
            event.preventDefault();
            window["browser"].tabs.create({
                url: (event.target as Element).getAttribute("href"),
            });
        });
    });

    const tab = await getCurrentTab();
    const { site, bias, reporting } = tabListener.details(tab);
    if (site) {
        // n, h
        // Add 50ms timeout to defeat popup opening animation
        setTimeout(function() {
            document.getElementById("bias").textContent = bias.name;
            document.getElementById("bias-class").classList.add(`mbfc-td-${site.b.toLowerCase()}`);
            document.getElementById("description").textContent = bias.description;
            document.getElementById("more-info").innerHTML = `<a href="${site.u}" target="_blank">Read the Media Bias/Fact Check detailed report</a>`;
            var factualParagraph = document.getElementById("factualParagraph");
            var factualEl = document.getElementById("factual");
            if (!site.r) {
                factualParagraph.style.display = "none";
            } else {
                factualParagraph.style.display = "block";
                factualEl.textContent = reporting.pretty;
                // change MOSTLY FACTUAL to MOSTLY
                //TODO
                // factualEl.classList.add([source.factual.split(' ')[0]]);
            }
            document.body.style.display = "block";
        }, 50);
    }
});
