import { useStorage } from "@plasmohq/storage/hook"

import { logger } from "../../shared/logger"
import Tab, { type TabDef } from "./tab"
import TabContent from "./tab-contents"

const log = logger("mbfc:options:components:tabs")

export default function Tabs({ tabs }: { tabs: TabDef[] }) {
  const [ct, setCurrentTab] = useStorage("currentTab", tabs[0].id)
  let currentTab = ct
  if (!currentTab) {
    currentTab = tabs[0].id
    setCurrentTab(currentTab)
      .then(() => log(`Current tab updated to ${currentTab}`))
      .catch((err) => console.error(err))
    log(`Updating current tab to ${currentTab}`)
  }
  return (
    <div className="flex flex-wrap" id="tabs-id">
      <div className="w-full">
        <ul className="flex mb-0 list-none flex-wrap pt-3 pb-4 flex-row">
          {tabs.map((tab) => (
            <Tab
              activate={() => {
                setCurrentTab(tab.id)
                  .then(() => log(`Current tab updated to ${currentTab}`))
                  .catch((err) => console.error(err))
              }}
              activeTab={currentTab}
              forId={tab.id}
              icon={tab.icon}
              text={tab.name}
              key={tab.id}
            />
          ))}
        </ul>
        <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
          <div className="px-4 py-5 flex-auto">
            <div className="tab-content tab-space">
              {tabs.map((tab) => (
                <TabContent activeTab={currentTab} id={tab.id} key={tab.id}>
                  {tab.component}
                </TabContent>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
