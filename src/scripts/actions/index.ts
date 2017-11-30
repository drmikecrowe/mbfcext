export const SCAN_PAGE = 'SCAN_PAGE'
export const SEND_PAGE_TAGS = 'SEND_PAGE_TAGS'
export const ADD_BOOKMARK = 'ADD_BOOKMARK'
export const SAVE_BOOKMARK = 'SAVE_BOOKMARK'

export const sendPageTags = (tags) => ({
  type: SEND_PAGE_TAGS,
  payload: tags
})

export const addBookmark = (siteInfo) => ({
  type: ADD_BOOKMARK,
  payload: siteInfo
})
