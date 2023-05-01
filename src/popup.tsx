import { faAngleDoubleRight, faCog } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useEffect, useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"

import Button from "~components/button"
import { getCurrentTab, getDomain } from "~utils"

import "./style.css"

import { GET_DOMAIN_FOR_TAB, type GetDomainForTabRequestBody, type GetDomainForTabResponseBody } from "~background/messages/get-domain-for-tab"

import { logger } from "./utils/logger"

const log = logger("mbfc:popup")

export interface PopupDetails {
  bias: string
  biasDescription: string
  mbfcLink: string
  rated?: boolean
}

const Rated = ({ bias, biasDescription, mbfcLink }: PopupDetails) => {
  return (
    <div>
      <h1 className="p-0 pb-2">{bias}</h1>
      <p className="text-sm">{biasDescription}</p>
      <a className="pt-2" href={mbfcLink} rel="noreferrer" target="_blank">
        Read the Media Bias/Fact Check detailed report&nbsp;
        <FontAwesomeIcon icon={faAngleDoubleRight} />
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
        <FontAwesomeIcon icon={faAngleDoubleRight} />
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
      const res = await sendToBackground<GetDomainForTabRequestBody, GetDomainForTabResponseBody>({
        name: GET_DOMAIN_FOR_TAB,
        body: { domain: domain.domain, path: domain.path },
      })
      if (!res || !res.site) {
        log(`Error: No site returned`)
        return
      }
      const { site } = res
      setBias(site.bias)
      setBiasDescription(site.biasDescription)
      setMbfcLink(site.mbfcLink)
      setRated(site.rated)
    })().catch((err) => {
      console.error(err)
    })
  }, [])

  return (
    <div style={{ width: "500px", height: "250px" }}>
      <div className="container mx-auto p-2 centered">
        <div className="absolute top-0 right-0">
          <div className="p-1">
            <Button handler={() => chrome.runtime.openOptionsPage()}>
              <FontAwesomeIcon icon={faCog} />
            </Button>
          </div>
        </div>

        <div className="clearfix" />
        <div className="pt-0">{rated ? <Rated bias={bias} biasDescription={biasDescription} mbfcLink={mbfcLink} /> : <Unrated />}</div>
      </div>
    </div>
  )
}

export default IndexPopup
