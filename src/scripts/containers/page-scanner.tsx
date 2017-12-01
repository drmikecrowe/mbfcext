import * as React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import ext from '../utils/ext'

import { SCAN_PAGE, sendPageTags } from '../actions'
import { Bookmark } from '../reducers/bookmarks'

// props of action-creator
interface DispatchProps {
  sendPageTags: typeof sendPageTags
}

interface State {}

class PageScannerContainer extends React.Component<DispatchProps, State> {
  private extractTags (): Bookmark {
    const url = document.location.href
    if (!url || !url.match(/^http/)) { return }

    const data = {
      title: '',
      description: '',
      url: document.location.href
    }

    const ogTitle = document.querySelector("meta[property='og:title']")
    if (ogTitle) {
      data.title = ogTitle.getAttribute('content')
    } else {
      data.title = document.title
    }

    const descriptionTag = document.querySelector("meta[property='og:description']") ||
                         document.querySelector("meta[name='description']")
    if (descriptionTag) {
      data.description = descriptionTag.getAttribute('content')
    }

    return data
  }

  componentDidMount () {
    ext.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === SCAN_PAGE) {
        const pageTags = this.extractTags()
        this.props.sendPageTags(pageTags)
      }
    })
  }

  render () {
    return (<div />)
  }
}

const mapDispatchToProps: DispatchProps = { sendPageTags }
const mapStateToProps = (): State => ({})

export default connect(mapStateToProps, mapDispatchToProps)(PageScannerContainer)
