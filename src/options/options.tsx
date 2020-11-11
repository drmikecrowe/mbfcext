import "assets/tailwind.scss";
import { m } from "malevic";
import { sync, getContext } from "malevic/umd/dom";
import { faCog } from "setup/font-awesome";
import { Icon } from "utils";
import { Config } from "./config";
import { ReleaseNotes } from "./releaseNotes";
import { About } from "./about";

const tabs = [
    {
        id: "settings",
        name: "Settings",
        icon: <Icon icon={faCog} />,
        component: <Config />,
    },
    {
        id: "release-notes",
        name: "Release Notes",
        icon: <Icon icon={faCog} />,
        component: <ReleaseNotes />,
    },
    {
        id: "about",
        name: "About",
        icon: <Icon icon={faCog} />,
        component: <About />,
    },
];

const Tab = ({ forId, text, icon, activate }): Element => {
    const { next, getStore, leave } = getContext();
    const store = getStore({ currentTab: tabs[0].id });
    const id = `tab-${forId}`;
    const active = store.currentTab === forId;
    const baseClasses =
        "text-xs font-bold uppercase px-5 py-3 shadow-lg rounded block leading-normal";
    const activeClasses = "text-white bg-blue-600";
    const inactiveClasses = "text-blue-600 bg-white";
    const cls = `${baseClasses} ${active ? activeClasses : inactiveClasses}`;
    const { node } = getContext();
    const e = document.getElementById(id);
    console.log("node", node);
    console.log("e", e);
    if (node && e) {
        const toRemove = active
            ? inactiveClasses.split(" ")
            : activeClasses.split(" ");
        const toAdd = active
            ? activeClasses.split(" ")
            : inactiveClasses.split(" ");
        toRemove.forEach((c) => e.children[0].classList.remove(c));
        toAdd.forEach((c) => e.children[0].classList.add(c));
        return leave();
    }
    return (
        <li
            key={id}
            class="-mb-px mr-2 last:mr-0 flex-auto text-center"
            id={id}
        >
            <a class={cls} href="#" onclick={activate}>
                {icon}
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
    const store = context.getStore({ currentTab: tabs[0].id });
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
