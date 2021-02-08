import "assets/tailwind.scss";
import { m } from "malevic";
import { sync, getContext } from "malevic/umd/dom";
import { Config } from "./config";
import { ReleaseNotes } from "./releaseNotes";
import { Intro } from "./intro";

const FaCog = (): Element => {
  return (
    <svg
      aria-hidden="true"
      class="svg-inline--fa fa-cog fa-w-16"
      data-icon="cog"
      data-prefix="fas"
      focusable="false"
      height="16px"
      role="img"
      style={{ display: "inline-block" }}
      viewBox="0 0 512 512"
      width="16px"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M487.4 315.7l-42.6-24.6c4.3-23.2 4.3-47 0-70.2l42.6-24.6c4.9-2.8 7.1-8.6 5.5-14-11.1-35.6-30-67.8-54.7-94.6-3.8-4.1-10-5.1-14.8-2.3L380.8 110c-17.9-15.4-38.5-27.3-60.8-35.1V25.8c0-5.6-3.9-10.5-9.4-11.7-36.7-8.2-74.3-7.8-109.2 0-5.5 1.2-9.4 6.1-9.4 11.7V75c-22.2 7.9-42.8 19.8-60.8 35.1L88.7 85.5c-4.9-2.8-11-1.9-14.8 2.3-24.7 26.7-43.6 58.9-54.7 94.6-1.7 5.4.6 11.2 5.5 14L67.3 221c-4.3 23.2-4.3 47 0 70.2l-42.6 24.6c-4.9 2.8-7.1 8.6-5.5 14 11.1 35.6 30 67.8 54.7 94.6 3.8 4.1 10 5.1 14.8 2.3l42.6-24.6c17.9 15.4 38.5 27.3 60.8 35.1v49.2c0 5.6 3.9 10.5 9.4 11.7 36.7 8.2 74.3 7.8 109.2 0 5.5-1.2 9.4-6.1 9.4-11.7v-49.2c22.2-7.9 42.8-19.8 60.8-35.1l42.6 24.6c4.9 2.8 11 1.9 14.8-2.3 24.7-26.7 43.6-58.9 54.7-94.6 1.5-5.5-.7-11.3-5.6-14.1zM256 336c-44.1 0-80-35.9-80-80s35.9-80 80-80 80 35.9 80 80-35.9 80-80 80z"
        fill="currentColor"
      />
    </svg>
  );
};

const FaBook = (): Element => {
  return (
    <svg
      aria-hidden="true"
      class="svg-inline--fa fa-book fa-w-14"
      data-icon="book"
      data-prefix="fas"
      focusable="false"
      height="16px"
      role="img"
      style={{ display: "inline-block" }}
      viewBox="0 0 448 512"
      width="16px"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M448 360V24c0-13.3-10.7-24-24-24H96C43 0 0 43 0 96v320c0 53 43 96 96 96h328c13.3 0 24-10.7 24-24v-16c0-7.5-3.5-14.3-8.9-18.7-4.2-15.4-4.2-59.3 0-74.7 5.4-4.3 8.9-11.1 8.9-18.6zM128 134c0-3.3 2.7-6 6-6h212c3.3 0 6 2.7 6 6v20c0 3.3-2.7 6-6 6H134c-3.3 0-6-2.7-6-6v-20zm0 64c0-3.3 2.7-6 6-6h212c3.3 0 6 2.7 6 6v20c0 3.3-2.7 6-6 6H134c-3.3 0-6-2.7-6-6v-20zm253.4 250H96c-17.7 0-32-14.3-32-32 0-17.6 14.4-32 32-32h285.4c-1.9 17.1-1.9 46.9 0 64z"
        fill="currentColor"
      />
    </svg>
  );
};

const tabs = [
  {
    id: "intro",
    name: "Introduction",
    icon: "faBook",
    component: <Intro />,
  },
  {
    id: "settings",
    name: "Settings",
    icon: "faCog",
    component: <Config />,
  },
  {
    id: "release-notes",
    name: "Release Notes",
    icon: "faBook",
    component: <ReleaseNotes />,
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
        {icon === "faBook" ? <FaBook /> : <FaCog />}
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
                <TabContent activeTab={store.currentTab} id={tab.id}>
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
