import { combineReducers } from 'redux'

import scans from './scans'
import bookmarks from './bookmarks'

export default combineReducers({ scans, bookmarks })
