import { SAVE_BOOKMARK } from '../actions'

const initialState = {
  items: []
}

export default (state = initialState, action) => {
  switch (action.type) {
    case SAVE_BOOKMARK:
      return {
        items: [ ...state.items, action.payload ]
      }
    default:
      return state
  }
}
