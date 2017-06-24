import React from 'react'
import { render } from 'react-dom'
import { Store } from 'react-chrome-redux'
import { Provider } from 'react-redux'

import PageScannerContainer from './containers/page-scanner'

const extension = '/* @echo extension */'
const proxyStore = new Store({
  portName: 'extension-demo-app',
  extensionId: extension === 'firefox' ? 'my-app-id@mozilla.org' : ''
})

proxyStore.ready().then(() => {
  render(
    <Provider store={proxyStore}>
      <PageScannerContainer />
    </Provider>
    , document.createElement('div')    // anonymous div
  )
})
