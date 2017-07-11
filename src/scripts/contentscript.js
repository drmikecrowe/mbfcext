import React from 'react'
import { render } from 'react-dom'
import { Store } from 'react-chrome-redux'
import { Provider } from 'react-redux'

import PageScannerContainer from './containers/page-scanner'

const extension = '/* @echo extension */'
const proxyStore = new Store({
  portName: 'extension-demo-app',
  //TODO extentision id error
  extensionId: extension === 'firefox' ? 'my-app-id@mozilla.org' : ''
})

let renderDOM = () => {
  const AsyncPageScanner = require('./containers/page-scanner').default
  render(
    <Provider store={proxyStore}>
      <AsyncPageScanner />
    </Provider>
    , document.createElement('div')    // anonymous div
  )
}

//TODO ready not called
proxyStore.ready().then(() => {
  renderDOM()
})
