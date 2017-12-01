import { Bookmark } from '../reducers/bookmarks'

export const SCAN_PAGE = 'SCAN_PAGE'
export const SEND_PAGE_TAGS = 'SEND_PAGE_TAGS'
export const ADD_BOOKMARK = 'ADD_BOOKMARK'
export const SAVE_BOOKMARK = 'SAVE_BOOKMARK'

export type ActionNames = typeof SCAN_PAGE |
                          typeof SEND_PAGE_TAGS |
                          typeof ADD_BOOKMARK |
                          typeof SAVE_BOOKMARK

export type Action<T extends ActionNames, P> = {
  type: T
  payload: P
}

export type Actions = Action<typeof SEND_PAGE_TAGS, Bookmark> |
                      Action<typeof ADD_BOOKMARK, Bookmark> |
                      Action<typeof SAVE_BOOKMARK, Bookmark>

type ActionCreator<T extends ActionNames, P> = (payload: P) => Action<T, P>

export const sendPageTags: ActionCreator<typeof SEND_PAGE_TAGS, Bookmark> = (tags: Bookmark) => ({
  type: SEND_PAGE_TAGS,
  payload: tags
})

export const addBookmark: ActionCreator<typeof ADD_BOOKMARK, Bookmark> = (siteInfo: Bookmark) => ({
  type: ADD_BOOKMARK,
  payload: siteInfo
})
