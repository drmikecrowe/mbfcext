import { combineReducers } from 'redux'

import scans, { Scans } from './scans'
import bookmarks, { Bookmarks } from './bookmarks'

export interface Store {
  bookmarks: Bookmarks
  scans: Scans
}

export default combineReducers<Store>({ scans, bookmarks })
