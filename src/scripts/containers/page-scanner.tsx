import * as React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import ext from '../utils/ext'

import { SCAN_PAGE, sendPageTags } from '../actions'

class PageScannerContainer extends React.Component<any, any> { //TODO FIXME
  static propTypes = {
    sendPageTags: PropTypes.func.isRequired
  }

  _extractTags = () => {
    var url = document.location.href
    if (!url || !url.match(/^http/)) { return }

    var data = {
      title: '',
      description: '',
      url: document.location.href
    }

    var ogTitle = document.querySelector("meta[property='og:title']")
    if (ogTitle) {
      data.title = ogTitle.getAttribute('content')
    } else {
      data.title = document.title
    }

    var descriptionTag = document.querySelector("meta[property='og:description']") ||
                         document.querySelector("meta[name='description']")
    if (descriptionTag) {
      data.description = descriptionTag.getAttribute('content')
    }

    return data
  }

  componentDidMount () {
    ext.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === SCAN_PAGE) {
        const pageTags = this._extractTags()
        this.props.sendPageTags(pageTags)
      }
    })
  }

  render () {
    return (<div />)
  }
}

const mapDispatchToProps = { sendPageTags }
const mapStateToProps = (state) => ({})

export default connect(mapStateToProps, mapDispatchToProps)(PageScannerContainer)
