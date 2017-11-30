import { SAVE_BOOKMARK } from '../actions'

// import axios from 'axios'

export default {
  ADD_BOOKMARK: (action) => {
    return async (dispatch, getState) => {
      console.log('# You can do some async job or access to chrome object here.')
      console.log('Saving bookmark: ', action.payload)

      // const res = await axios.post('http://my-api-server.com/bookmarks/')
      // console.log(res)

      return dispatch({ type: SAVE_BOOKMARK, payload: action.payload })
    }
  }
}
