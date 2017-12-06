import { applyMiddleware, createStore } from 'redux'
import { alias, wrapStore } from 'react-chrome-redux'
import thunk from 'redux-thunk'

import rootReducer, { Store } from './reducers'
import aliases from './aliases'

const middlewares = [alias(aliases), thunk]
const store = createStore<Store>(rootReducer,
  applyMiddleware(...middlewares)
)

wrapStore(store, {
  portName: 'extension-demo-app'
})
