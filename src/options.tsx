/**
 * Options entry point - Minimal React wrapper for vanilla implementation
 * React is required by Plasmo, but all dynamic content uses vanilla DOM
 */

import { useEffect, useRef } from "react"

import { Storage } from "@plasmohq/storage"

import { renderIntro } from "./options/intro"
import { renderOptions } from "./options/options"
import { renderReleaseNotes } from "./options/release-notes"
import { showTabContent } from "./options/components/tab-contents"
import { BookIcon, GearIcon } from "./shared/elements/VanillaIcons"
import { logger } from "./shared/logger"

import "./style.css"

const log = logger("mbfc:options:main")

interface TabDef {
  id: string
  name: string
  icon: string
  render: (containerId: string) => void | Promise<void>
}

function IndexOptions() {
  const tabListRef = useRef<HTMLUListElement>(null)
  const tabContentContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tabList = tabListRef.current
    const tabContentContainer = tabContentContainerRef.current

    if (!tabList || !tabContentContainer) return

    const storage = new Storage()

    const tabs: TabDef[] = [
      {
        id: "intro",
        name: "Introduction",
        icon: "faBook",
        render: (containerId) => renderIntro(containerId),
      },
      {
        id: "settings",
        name: "Settings",
        icon: "faCog",
        render: async (containerId) => {
          await renderOptions(containerId)
        },
      },
      {
        id: "release-notes",
        name: "Release Notes",
        icon: "faBook",
        render: (containerId) => renderReleaseNotes(containerId),
      },
    ]

    const initOptions = async () => {
      let currentTab = await storage.get("currentTab")

      // Validate current tab or default to first
      if (!currentTab || !tabs.find((t) => t.id === currentTab)) {
        currentTab = tabs[0].id
        await storage.set("currentTab", currentTab)
      }

      const baseClasses = "text-xs font-bold uppercase px-5 py-3 shadow-lg rounded block leading-normal"
      const activeClasses = `${baseClasses} text-white bg-blue-600`
      const inactiveClasses = `${baseClasses} text-blue-600 bg-white`

      // Create tab buttons
      tabs.forEach((tab) => {
        const li = document.createElement("li")
        li.className = "-mb-px mr-2 last:mr-12 flex-auto text-center"
        li.id = `tab-${tab.id}`

        const a = document.createElement("a")
        a.id = `a-${tab.id}`
        a.href = "#"

        // Add icon
        const iconElement = tab.icon === "faBook" ? BookIcon(14) : GearIcon(14)
        a.appendChild(iconElement)
        a.appendChild(document.createTextNode("\u00A0"))
        a.appendChild(document.createTextNode(tab.name))

        // Set initial classes
        a.className = tab.id === currentTab ? activeClasses : inactiveClasses

        // Handle click
        a.addEventListener("click", async (e) => {
          e.preventDefault()

          // Update active tab in storage
          await storage.set("currentTab", tab.id)

          // Update all tab button styles
          tabs.forEach((t) => {
            const tabLink = document.getElementById(`a-${t.id}`)
            if (tabLink) {
              tabLink.className = t.id === tab.id ? activeClasses : inactiveClasses
            }
          })

          // Show the correct content
          showTabContent(tab.id)

          // Render content if not already rendered (container is empty)
          const container = document.getElementById(tab.id)
          if (container && container.children.length === 0) {
            await tab.render(tab.id)
          }

          log(`Current tab updated to ${tab.id}`)
        })

        li.appendChild(a)
        tabList.appendChild(li)
      })

      // Create content containers
      for (const tab of tabs) {
        const contentDiv = document.createElement("div")
        contentDiv.id = tab.id
        contentDiv.setAttribute("data-tab-content", "true")

        if (tab.id === currentTab) {
          contentDiv.style.visibility = "visible"
          contentDiv.style.display = "block"
        } else {
          contentDiv.style.visibility = "hidden"
          contentDiv.style.display = "none"
        }

        tabContentContainer.appendChild(contentDiv)
      }

      // Render initial content
      const activeTab = tabs.find((t) => t.id === currentTab)
      if (activeTab) {
        await activeTab.render(activeTab.id)
      }
    }

    initOptions().catch((err) => {
      console.error(err)
    })
  }, [])

  return (
    <div style={{ display: "flex", flexDirection: "column", padding: 16 }}>
      <div className="container config mx-auto justify-center items-center">
        <div className="flex flex-wrap" id="tabs-id">
          <div className="w-full">
            <ul ref={tabListRef} className="flex mb-0 list-none flex-wrap pt-3 pb-4 flex-row" id="tab-list">
            </ul>
            <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
              <div className="px-4 py-5 flex-auto">
                <div ref={tabContentContainerRef} className="tab-content tab-space" id="tab-content-container">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IndexOptions
