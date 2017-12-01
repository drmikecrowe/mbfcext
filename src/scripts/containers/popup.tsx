import * as React from 'react'
import * as ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import storage from '../utils/storage'
import ext from '../utils/ext'

import { SCAN_PAGE, addBookmark } from '../actions'
import { Store } from '../reducers'
import { Bookmark } from '../reducers/bookmarks'

// props of redux state
interface StateProps {
  isScanning: boolean,
  bookmarkSiteInfo: Bookmark
}

// props of action-creator
interface DispatchProps {
  addBookmarkAsync: typeof addBookmark
}

interface State {
  resultMessage: string
}

const SiteDescription = ({
  siteInfo,
  onBookmark
}: {
  siteInfo: Bookmark,
  onBookmark: () => {}
}) => (
  <div>
    <div className='site-description'>
      <h3 className='title'>{siteInfo.title}</h3>
      <p className='description'>{siteInfo.description}</p>
      <a href={siteInfo.url} target='_blank' className='url'>{siteInfo.url}</a>
    </div>
    <div className='action-container'>
      <button className='btn btn-primary' onClick={onBookmark}>Save</button>
    </div>
  </div>
)

class PopupContainer extends React.Component<StateProps & DispatchProps, State> {
  constructor (props) {
    super(props)
    this.state = {
      resultMessage: null
    }
  }

  componentDidMount () {
    setTimeout(() => {
      storage.get('color', (resp) => {
        if (resp && resp.color) {
          const parentElem = ReactDOM.findDOMNode(this).parentElement
          parentElem.style.backgroundColor = resp.color
        }
      })
    }, 0)

    ext.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      var activeTab = tabs[0]
      ext.tabs.sendMessage(activeTab.id, { action: SCAN_PAGE })
    })
  }

  private resultMessage (message) {
    this.setState({ ...this.state, resultMessage: message })
  }

  handleOptionClick () {
    ext.tabs.create({ 'url': ext.extension.getURL('options.html') })
  }

  handleSaveBookmark = async () => {
    const { addBookmarkAsync, bookmarkSiteInfo } = this.props
    try {
      const data = await addBookmarkAsync(bookmarkSiteInfo)
      console.log(data)
      this.resultMessage('Your bookmark was saved successfully!')
    } catch (err) {
      console.log(err)
      this.resultMessage('Sorry, there was an error while saving your bookmark.')
    }
  }

  render () {
    let siteDescContent = null
    let resultMessage = this.state.resultMessage
    if (!this.props.isScanning) {
      if (this.props.bookmarkSiteInfo) {
        siteDescContent = (
          <SiteDescription
            siteInfo={this.props.bookmarkSiteInfo}
            onBookmark={this.handleSaveBookmark} />
        )
      } else {
        resultMessage = "Sorry, could not extract this page's title and URL"
      }
    }

    return (
      <div className='popup-content'>
        <h1 className='app-name'>Extension Boilerplate</h1>
        <div>
          {siteDescContent}
          {resultMessage}
        </div>
        <footer>
          <p>
            <small>
              <a href='#' className='js-options' onClick={this.handleOptionClick}>Options</a>
            </small>
          </p>
        </footer>
      </div>
    )
  }
}

const mapDispatchToProps: DispatchProps = {
  addBookmarkAsync: addBookmark
}

const mapStateToProps = (state: Store): StateProps => ({
  isScanning: state.scans.isScanning,
  bookmarkSiteInfo: state.scans.scannedPageTags
})

export default connect(mapStateToProps, mapDispatchToProps)(PopupContainer)
