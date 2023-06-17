import type { TabDef } from "./options/components/tab"
import Tabs from "./options/components/tabs"
import Intro from "./options/intro"
import Config from "./options/options"
import ReleaseNotes from "./options/release-notes"

import "./style.css"

const tabs: TabDef[] = [
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
]

function IndexOptions() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: 16,
      }}>
      <div className="container config mx-auto justify-center items-center">
        <Tabs tabs={tabs} />
      </div>
    </div>
  )
}

export default IndexOptions
