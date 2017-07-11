import { applyMiddleware, createStore } from 'redux'
import { alias, wrapStore } from 'react-chrome-redux'
import thunk from 'redux-thunk'

import rootReducer from './reducers'
import aliases from './aliases'

const preloadedState = {}
const middlewares = [alias(aliases), thunk]
const store = createStore(rootReducer, preloadedState,
  applyMiddleware(...middlewares)
)

wrapStore(store, {
  portName: 'extension-demo-app',
})

if (module.hot) {
  const clientEmitter = require('webpack/hot/emitter')
  clientEmitter.on('webpackHotUpdate', currentHash => {
    chrome.runtime.reload()
  })
}
