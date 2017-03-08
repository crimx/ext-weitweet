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
//                    +-+ selected  +-------+ master.src != src
//                    |   [deselect all]      [select all]
//                    |
//       +-+ master +-+
//       |            |
//       |            +-+ unselected
//       |                [select all]
//       |
//       |
//       |
// src +-+                                          +-+ sla^e.src.bak == src  +--------+!deselect mode
//       |                                          |   slave.src.bak == another.src    [deselect another]
//       |                                          |   [deselect master]               [select self]
//       |                      +-+ selected     ---+
//       |                      |  [deselect self]  |
//       |                      |                   |
//       |                      |                   |
//       +-+ slave +-------------------             +-+ slave.src.bak != src +--+ src == another.src
//           [deselect master]  |                       [select self]         [select master]

//                              +-+ unselected +--------+ src == another.src
//                                  [select self]         [select master]
  [types.UPDATE_PHOTO] (state, {type, photo, deselect}) {
    const master = state.master
    const twitter = state.twitter
    const weibo = state.weibo
    if (type === 'master') {
      if (master.photo.src) {
        if (master.photo.src !== photo.src) {
          master.photo = twitter.photo = weibo.photo = photo
        } else {
          master.photo = twitter.photo = weibo.photo = {}
        }
      } else {
        master.photo = twitter.photo = weibo.photo = photo
      }
    } else {
      master.photo = {}
      let slave1, slave2
      if (type === 'twitter') {
        slave1 = twitter
        slave2 = weibo
      } else {
        slave1 = weibo
        slave2 = twitter
      }
      if (slave1.photo.src) {
        let slave1src = slave1.photo.src
        slave1.photo = {}
        if (slave1src === photo.src) {
          if (slave1src === slave2.photo.src) {
            master.photo = {}
            if (!deselect) {
              slave2.photo = {}
              slave1.photo = photo
            }
          }
        } else {
          slave1.photo = photo
          if (photo.src === slave2.photo.src) {
            master.photo = photo
          }
        }
      } else {
        slave1.photo = photo
        if (photo.src === slave2.photo.src) {
          master.photo = photo
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
