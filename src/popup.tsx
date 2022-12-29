import { useEffect, useState } from "react"
import { sendMessage } from "webext-bridge"

import Button from "~components/button"
import FaAngleDoubleRight from "~components/fa/fa-angle-double-right"
import FaCog from "~components/fa/fa-cog"
import { getDomain } from "~utils/get-domain"
import { getCurrentTab } from "~utils/tabUtils"

import { logger } from "./utils/logger"

const log = logger("mbfc:popup")

export interface PopupDetails {
  bias: string
  biasDescription: string
  mbfcLink: string
  rated: boolean
}

const Rated = ({ bias, biasDescription, mbfcLink }) => {
  return (
    <div>
      <h1 className="p-0 pb-2">{bias}</h1>
      <p className="text-sm">{biasDescription}</p>
      <a className="pt-2" href={mbfcLink} rel="noreferrer" target="_blank">
        Read the Media Bias/Fact Check detailed report&nbsp;
        <FaAngleDoubleRight />
      </a>
    </div>
  )
}

const Unrated = () => {
  return (
    <div>
      <h1 className="p-0 pb-2">Not a rated site</h1>
      <p>Feel free to view the full list of site rating and bias analysis at the</p>
      <a className="pt-2" href="https://mediabiasfactcheck.com" rel="noreferrer" target="_blank">
        Media Bias/Fact Check Website &nbsp;
        <FaAngleDoubleRight />
      </a>
    </div>
  )
}

function IndexPopup() {
  const [bias, setBias] = useState("")
  const [biasDescription, setBiasDescription] = useState("")
  const [mbfcLink, setMbfcLink] = useState("")
  const [rated, setRated] = useState(false)

  useEffect(() => {
    ;(async () => {
      const ct = await getCurrentTab()
      if (ct.isErr()) return

      const domain = getDomain(ct.value.url)
      const site: PopupDetails | undefined = await sendMessage("get-domain-for-tab", { domain: domain.domain, path: domain.path }, "background")
      if (!site) {
        log(`Error: No site returned`)
        return
      }
      setBias(site.bias)
      setBiasDescription(site.biasDescription)
      setMbfcLink(site.mbfcLink)
      setRated(site.rated)
    })().catch((err) => {
      console.error(err)
    })
  }, [])

  return (
    <div className="w-2/4" style={{width: "400px", height: "300px"}}>
      <div className="container mx-auto p-2 centered">
        <div className="absolute top-0 right-0">
          <div className="p-1">
            <Button handler={() => chrome.runtime.openOptionsPage()}>
              <FaCog />
            </Button>
          </div>
        </div>

        <div className="clearfix" />
        <div className="pt-3">{rated ? <Rated bias={bias} biasDescription={biasDescription} mbfcLink={mbfcLink} /> : <Unrated />}</div>
      </div>
    </div>
  )
}

export default IndexPopup
