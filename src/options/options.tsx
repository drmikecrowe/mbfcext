import "assets/tailwind.scss";
import { m } from "malevic";
import { sync, getContext } from "malevic/umd/dom";
import { faBook, faCog } from "setup/font-awesome";
import { Icon } from "utils";
import { Config } from "./config";
import { ReleaseNotes } from "./releaseNotes";

const tabs = [
    {
        id: "release-notes",
        name: "Release Notes",
        icon: faBook,
        component: <ReleaseNotes />,
    },
    {
        id: "settings",
        name: "Settings",
        icon: faCog,
        component: <Config />,
    },
];

const Tab = ({ forId, text, icon, activate, activeTab }): Element => {
    const { node } = getContext();
    const tabId = `tab-${forId}`;
    const aId = `a-${forId}`;
    const active = activeTab === forId;
    const baseClasses =
        "text-xs font-bold uppercase px-5 py-3 shadow-lg rounded block leading-normal";
    const activeClasses = `${baseClasses} text-white bg-blue-600`;
    const inactiveClasses = `${baseClasses} text-blue-600 bg-white`;
    const cls = `${baseClasses} ${active ? activeClasses : inactiveClasses}`;
    if (node) {
        const a: Element = node.children[0];
        a.childNodes.forEach((c) => a.removeChild(c));
    }
    return (
        <li
            key={tabId}
            class="-mb-px mr-2 last:mr-0 flex-auto text-center"
            id={tabId}
        >
            <a key={aId} class={cls} href="#" onclick={activate}>
                <Icon icon={icon} />
                &nbsp;
                {text}
            </a>
        </li>
    );
};

const TabContent = ({ id, activeTab }, ...children) => {
    const active = activeTab === id;
    return (
        <div class={{ block: active, hidden: !active }} id={id}>
            {...children}
        </div>
    );
};

const Tabs = () => {
    const context = getContext();
    const { getStore } = context;
    const store = getStore({ currentTab: tabs[0].id });
    return (
        <div class="flex flex-wrap" id="tabs-id">
            <div class="w-full">
                <ul class="flex mb-0 list-none flex-wrap pt-3 pb-4 flex-row">
                    {tabs.map((tab) => (
                        <Tab
                            activate={() => {
                                store.currentTab = tab.id;
                                context.refresh();
                            }}
                            activeTab={store.currentTab}
                            forId={tab.id}
                            icon={tab.icon}
                            text={tab.name}
                        />
                    ))}
                </ul>
                <div class="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
                    <div class="px-4 py-5 flex-auto">
                        <div class="tab-content tab-space">
                            {tabs.map((tab) => (
                                <TabContent
                                    activeTab={store.currentTab}
                                    id={tab.id}
                                >
                                    {tab.component}
                                </TabContent>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const main = async () => {
    const e = document.getElementById("app") as Element;

    sync(
        e,
        <div class="container config mx-auto justify-center items-center">
            <Tabs />
        </div>
    );
};

main()
    .then(() => console.log("done"))
    .catch((err) => {
        console.error(err);
    });
