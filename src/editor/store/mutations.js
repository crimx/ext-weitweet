import * as types from './types'

export default {
  [types.UPDATE_MASTER_TEXT] (state, {text}) {
    if (state.master.isSlavery) {
      // update all text
      state.master.text = text
      state.twitter.text = text
      state.weibo.text = text
    } else if (!state.master.isRequestingSlavery) {
      state.master.isRequestingSlavery = true
    }
  },
  [types.UPDATE_TWITTER_TEXT] (state, {text}) {
    state.twitter.text = text
    state.isSlavery = false
  },
  [types.UPDATE_WEIBO_TEXT] (state, {text}) {
    state.weibo.text = text
    state.isSlavery = false
  },
  [types.UPDATE_MASTER_PHOTO] (state, {img}) {
    state.master.photo = img
  },
  [types.UPDATE_WEIBO_PHOTO] (state, {img}) {
    state.weibo.photo = img
  },
  [types.UPDATE_TWITTER_PHOTO] (state, {img}) {
    state.twitter.photo = img
  },
  [types.REQUEST_SLAVERY_FINISH] (state, {isSlavery, text}) {
    state.master.isRequestingSlavery = false
    state.master.isSlavery = isSlavery
    if (isSlavery === true && text) {
      // update all text
      state.master.text = text
      state.twitter.text = text
      state.weibo.text = text
    }
  }
}
