import * as types from './types'
import * as accounts from './oauth-helper'

export default {
  [types.LOG_IN_TWITTER] ({commit, state}) {
    commit(types.UPDATE_TWITTER_BOX_STATE, {type: 'loading'})
  },

  [types.LOG_IN_WEIBO] ({commit, state}) {
    commit(types.UPDATE_WEIBO_BOX_STATE, {type: 'loading'})
    accounts.weibo.getAccessToken()
    .then(data => {
      commit(types.UPDATE_WEIBO_TOKEN, data)
      accounts.weibo.getUserInfo(data)
      .then(info => {
        commit(types.UPDATE_WEIBO_USER_INFO, {
          fullname: info.screen_name,
          username: info.screen_name,
          avatar: info.avatar_large
        })
        endLoading()
      }, endLoading)
    }, endLoading)

    function endLoading () {
      commit(types.UPDATE_WEIBO_BOX_STATE, {type: ''})
    }
  },

  [types.UPDATE_STORAGE] ({commit, state, dispatch}) {
    chrome.storage.local.get(['twitter', 'weibo'], ({twitter, weibo}) => {
      if (twitter) { commit(types.UPDATE_TWITTER_STORAGE, twitter) }
      if (weibo) { commit(types.UPDATE_WEIBO_STORAGE, weibo) }
      dispatch(types.CHECK_TOKEN)
    })
  },

  [types.CHECK_TOKEN] ({commit, state}) {
    if (state.weibo.accessToken) {
      accounts.weibo.checkToken(state.weibo.accessToken)
      .then(expireIn => {
        if (expireIn <= 0) {
          commit(types.UPDATE_WEIBO_TOKEN, {token: ''})
        }
      }, () => commit(types.UPDATE_WEIBO_TOKEN, {token: ''}))
    }
  },

  [types.POST_WEIBO] ({commit, state}) {
  },

  [types.POST_WEIBO] ({commit, state, dispatch}) {
    let token = state.weibo.accessToken
    let text = state.weibo.text
    let photo = state.weibo.photo
    if (token && text) {
      commit(types.UPDATE_WEIBO_BOX_STATE, {type: 'loading'})
      if (photo.src) {
        accounts.weibo.postWithImage({token, text, photo})
        .then(() => {
          timeoutBoxStateSuccess(commit, 'weibo')
        }, (error) => {
          commit(types[`UPDATE_WEIBO_BOX_STATE`], {type: 'error', error})
        })
      } else {
        accounts.weibo.post({token, text})
        .then(() => {
          timeoutBoxStateSuccess(commit, 'weibo')
        }, (error) => {
          commit(types[`UPDATE_WEIBO_BOX_STATE`], {type: 'error', error})
        })
      }
    }
  },

  [types.POST_MASTER] ({dispatch}) {
    dispatch(types.POST_TWITTER)
    dispatch(types.POST_WEIBO)
  }
}

function timeoutBoxStateSuccess (commit, type) {
  type = type.toUpperCase()
  commit(types[`UPDATE_${type}_BOX_STATE`], {type: 'success'})
  setTimeout(() => {
    commit(types[`UPDATE_${type}_BOX_STATE`], {type: ''})
  }, 1700)
}
