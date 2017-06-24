import React from 'react'
import { render } from 'react-dom'
import { Store } from 'react-chrome-redux'
import { Provider } from 'react-redux'

import PopupContainer from './containers/popup'

const proxyStore = new Store({
  portName: 'extension-demo-app'
})

proxyStore.ready().then(() => {
  render(
    <Provider store={proxyStore}>
      <PopupContainer />
    </Provider>
    , document.getElementById('app')
  )
})
