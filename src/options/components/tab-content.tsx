export default function TabContent({ id, activeTab, children }) {
  const active = activeTab === id
  return (
    <div
      style={{
        visibility: active ? "visible" : "hidden",
        display: active ? "block" : "none"
      }}
      id={id}>
      {children}
    </div>
  )
}
