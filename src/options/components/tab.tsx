import type { ReactElement } from "react"

import FaBook from "../../components/fa/fa-book"
import FaCog from "../../components/fa/fa-cog"

export interface TabDef {
  id: string
  name: string
  icon: string
  component: ReactElement
}

export default function Tab({ forId, text, icon, activate, activeTab }: { forId: string; text: string; icon: string; activate: () => void; activeTab: string }) {
  const tabId = `tab-${forId}`
  const aId = `a-${forId}`
  const active = activeTab === forId
  const baseClasses = "text-xs font-bold uppercase px-5 py-3 shadow-lg rounded block leading-normal"
  const activeClasses = `${baseClasses} text-white bg-blue-600`
  const inactiveClasses = `${baseClasses} text-blue-600 bg-white`
  const cls = `${baseClasses} ${active ? activeClasses : inactiveClasses}`
  return (
    <li key={tabId} className="-mb-px mr-2 last:mr-12 flex-auto text-center" id={tabId}>
      <a key={aId} className={cls} href="#" onClick={activate}>
        {icon === "faBook" ? <FaBook /> : <FaCog />}
        &nbsp;
        {text}
      </a>
    </li>
  )
}
