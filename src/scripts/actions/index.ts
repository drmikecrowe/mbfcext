import { Action } from 'redux'
import { Bookmark } from '../reducers/bookmarks'

export const SCAN_PAGE = 'SCAN_PAGE'
export const SEND_PAGE_TAGS = 'SEND_PAGE_TAGS'
export const ADD_BOOKMARK = 'ADD_BOOKMARK'
export const SAVE_BOOKMARK = 'SAVE_BOOKMARK'

export interface SendPageTagsAction extends Action {
  type: typeof SEND_PAGE_TAGS
  payload: Bookmark
}

export interface AddBookmarkAction extends Action {
  type: typeof ADD_BOOKMARK
  payload: Bookmark
}

export interface SaveBookmarkAction extends Action {
  type: typeof SAVE_BOOKMARK
  payload: Bookmark
}

export const sendPageTags = (tags: Bookmark): SendPageTagsAction => ({
  type: SEND_PAGE_TAGS,
  payload: tags
})

export const addBookmark = (siteInfo: Bookmark): AddBookmarkAction => ({
  type: ADD_BOOKMARK,
  payload: siteInfo
})
