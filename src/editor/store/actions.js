import * as types from './types'
import * as accounts from './oauth-helper'

export default {
  [types.LOG_IN_TWITTER] ({commit, dispatch}) {
    commit(types.UPDATE_TWITTER_BOX_STATE, {type: 'loading'})
    accounts.twitter.getAuthorizeUrl()
      .then(url => {
        chrome.tabs.create({url}, tab => {
          requestTwitterPin()
          commit(types.UPDATE_TWITTER_BOX_STATE, {type: 'pin'})

          function requestTwitterPin () {
            chrome.tabs.sendMessage(tab.id, {msg: 'REQUEST_TWITTER_PIN'}, response => {
              if (!response) {
                if (tab.status === 'loading') {
                  setTimeout(requestTwitterPin, 200)
                }
                return
              }
              if (response.msg === 'NOT_YET') {
                setTimeout(requestTwitterPin, 200)
              } else if (response.msg === 'PIN') {
                dispatch(types.TWITTER_PIN, {pin: response.code})
                chrome.tabs.remove(tab.id)
              }
            })
          }
        })
      })
      .catch(error => commit(types.UPDATE_TWITTER_BOX_STATE, {type: 'error', error}))
  },

  [types.TWITTER_PIN] ({commit}, {pin}) {
    accounts.twitter.getAccessToken(pin)
      .then(payload => {
        commit(types.UPDATE_TWITTER_TOKEN, payload)
        accounts.twitter.getUserInfo()
          .then(info => {
            commit(types.UPDATE_TWITTER_USER_INFO, info)
            endLoading()
          })
      })
      .catch(error => endLoading(error))
    function endLoading () {
      commit(types.UPDATE_TWITTER_BOX_STATE, {type: ''})
    }
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
      if (twitter) {
        commit(types.UPDATE_TWITTER_STORAGE, twitter)
        accounts.twitter.codebird.setToken(twitter.accessToken, twitter.accessSecret)
      }
      if (weibo) { commit(types.UPDATE_WEIBO_STORAGE, weibo) }
      // dispatch(types.WEIBO_)
    })
  },

  [types.CHECK_TWITTER_TOKEN] ({commit, state}) {
    if (state.twitter.accessToken) {
      accounts.twitter.getUserInfo()
        .then(info => commit(types.UPDATE_TWITTER_USER_INFO, info))
        .catch(() => commit(types.UPDATE_TWITTER_TOKEN, {token: ''}))
    }
  },

  [types.CHECK_WEIBO_TOKEN] ({commit, state}) {
    if (state.weibo.accessToken) {
      accounts.weibo.checkToken(state.weibo.accessToken)
        .then(expireIn => {
          if (expireIn <= 0) {
            commit(types.UPDATE_WEIBO_TOKEN, {token: ''})
          } else {
            accounts.weibo.getUserInfo({
              token: state.weibo.accessToken,
              uid: state.weibo.uid
            }).then(info => {
              commit(types.UPDATE_WEIBO_USER_INFO, {
                fullname: info.screen_name,
                username: info.screen_name,
                avatar: info.avatar_large
              })
            })
          }
        })
        .catch(() => commit(types.UPDATE_WEIBO_TOKEN, {token: ''}))
    }
  },

  [types.POST_TWITTER] ({commit, state}) {
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

  [types.POST_MASTER] ({state, dispatch}) {
    if (state.twitter.accessToken) { dispatch(types.POST_TWITTER) }
    if (state.weibo.accessToken) { dispatch(types.POST_WEIBO) }
  }
}

function timeoutBoxStateSuccess (commit, type) {
  type = type.toUpperCase()
  commit(types[`UPDATE_${type}_BOX_STATE`], {type: 'success'})
  setTimeout(() => {
    commit(types[`UPDATE_${type}_BOX_STATE`], {type: ''})
  }, 1700)
}
