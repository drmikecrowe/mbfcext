import { SCAN_PAGE, SEND_PAGE_TAGS } from '../actions'
import { Bookmark } from './bookmarks'

export interface Scans {
  isScanning: boolean
  scannedPageTags: Bookmark
}

const initialState: Scans = {
  isScanning: false,
  scannedPageTags: null
}

export default (state: Scans = initialState, action) => {
  switch (action.type) {
    case SCAN_PAGE:
      return {
        isScanning: true,
        scannedPageTags: null
      }
    case SEND_PAGE_TAGS:
      return {
        isScanning: false,
        scannedPageTags: action.payload
      }
    default:
      return state
  }
}
