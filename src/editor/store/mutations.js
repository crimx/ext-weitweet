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

  [types.UPDATE_TWITTER_BOX_STATE] (state, {type, error}) {
    state.twitter.errMsg = null
    if (type === 'error' && error) {
      state.twitter.errMsg = error
    }
    state.twitter.boxState = type
  },
  [types.UPDATE_WEIBO_BOX_STATE] (state, {type, error}) {
    state.weibo.errMsg = null
    if (type === 'error' && error) {
      state.weibo.errMsg = error
    }
    state.weibo.boxState = type
  },

  [types.UPDATE_TWITTER_TOKEN] (state, {token}) {
    state.twitter.accessToken = token
    chrome.storage.local.set({twitter: state.twitter})
  },
  [types.UPDATE_WEIBO_TOKEN] (state, {token, uid}) {
    state.weibo.accessToken = token
    state.weibo.uid = uid
    chrome.storage.local.set({weibo: state.weibo})
  },

  [types.UPDATE_TWITTER_USER_INFO] (state, {fullname, username, avatar}) {
    state.twitter.fullname = fullname
    state.twitter.username = username
    state.twitter.avatar = avatar
    chrome.storage.local.set({twitter: state.twitter})
  },
  [types.UPDATE_WEIBO_USER_INFO] (state, {fullname, username, avatar}) {
    state.weibo.fullname = fullname
    state.weibo.username = username
    state.weibo.avatar = avatar
    chrome.storage.local.set({weibo: state.weibo})
  },

  [types.UPDATE_TWITTER_STORAGE] (state, twitterState) {
    state.twitter = twitterState
  },
  [types.UPDATE_WEIBO_STORAGE] (state, {fullname, username, avatar, uid, accessToken}) {
    state.weibo.fullname = fullname
    state.weibo.username = username
    state.weibo.avatar = avatar
    state.weibo.uid = uid
    state.weibo.accessToken = accessToken
  }
}
