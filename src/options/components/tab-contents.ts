/**
 * Tab content visibility management
 */

export function showTabContent(id: string): void {
  const allTabs = document.querySelectorAll("[data-tab-content]")
  allTabs.forEach((tab) => {
    const el = tab as HTMLElement
    if (el.id === id) {
      el.style.visibility = "visible"
      el.style.display = "block"
    } else {
      el.style.visibility = "hidden"
      el.style.display = "none"
    }
  })
}

export function createTabContentContainer(id: string): HTMLDivElement {
  const div = document.createElement("div")
  div.id = id
  div.setAttribute("data-tab-content", "true")
  div.style.visibility = "hidden"
  div.style.display = "none"
  return div
}
