/**
 * Master box and slave boxes
 */
import * as types from '../types'

export const state = {
  master: {
    text: '',
    // selected photos
    photos: [],
    // slave boxes being controlled
    isSlavery: true,
    isRequestingSlavery: false
  },
  twitter: {
    text: '',
    photos: [],
    isLogIn: false
  },
  weibo: {
    text: '',
    photos: [],
    isLogIn: false
  }
}

export const getters = {
}

export const actions = {
}

export const mutations = {
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

export default {
  state,
  getters,
  actions,
  mutations
}
