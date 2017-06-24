import React from 'react'
import { render } from 'react-dom'
import { Store } from 'react-chrome-redux'
import { Provider } from 'react-redux'

import PageScannerContainer from './containers/page-scanner'

const proxyStore = new Store({
  portName: 'extension-demo-app'
})

proxyStore.ready().then(() => {
  render(
    <Provider store={proxyStore}>
      <PageScannerContainer />
    </Provider>
    , document.createElement('div')    // anonymous div
  )
})
