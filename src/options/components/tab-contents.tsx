import type { ReactNode } from "react"

export default function TabContent({ id, activeTab, children }: { id: string; activeTab: string; children: ReactNode }) {
  const active = activeTab === id
  return (
    <div
      style={{
        visibility: active ? "visible" : "hidden",
        display: active ? "block" : "none",
      }}
      id={id}>
      {children}
    </div>
  )
}
