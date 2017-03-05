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
    if (state.master.isSlavery) {
      state.master.isSlavery = false
    }
  },
  [types.UPDATE_WEIBO_TEXT] (state, {text}) {
    state.weibo.text = text
    if (state.master.isSlavery) {
      state.master.isSlavery = false
    }
  },
  [types.UPDATE_PHOTO] (state, {type, src}) {
    if (type === 'master') {
      if (state.master.photo === src) {
        // already selected, now cancel it
        state.master.photo = ''
        state.twitter.photo = ''
        state.weibo.photo = ''
      } else {
        state.master.photo = src
        state.twitter.photo = src
        state.weibo.photo = src
      }
    } else if (type === 'twitter') {
      state.master.photo = ''
      if (state.twitter.photo === src) {
        state.twitter.photo = ''
      } else {
        state.twitter.photo = src
        if (state.weibo.photo === src) {
          state.master.photo = src
        }
      }
    } else if (type === 'weibo') {
      state.master.photo = ''
      if (state.weibo.photo === src) {
        state.weibo.photo = ''
      } else {
        state.weibo.photo = src
        if (state.twitter.photo === src) {
          state.master.photo = src
        }
      }
    }
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
  },

  [types.UPDATE_TWITTER_LOGING_IN] (state, {flag}) {
    state.twitter.isLogingIn = flag
  },
  [types.UPDATE_WEIBO_LOGING_IN] (state, {flag}) {
    state.weibo.isLogingIn = flag
  }
}
