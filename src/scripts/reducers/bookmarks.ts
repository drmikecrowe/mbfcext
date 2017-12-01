import { SAVE_BOOKMARK } from '../actions'

export interface Bookmark {
  title: string
  description: string
  url: string
}

export interface Bookmarks {
  items: Array<Bookmark>
}

const initialState: Bookmarks = {
  items: []
}

export default (state: Bookmarks = initialState, action) => {
  switch (action.type) {
    case SAVE_BOOKMARK:
      return {
        items: [ ...state.items, action.payload ]
      }
    default:
      return state
  }
}
