/**
 * Master box and slave boxes
 */
import * as types from '../types'

const invoke = Symbol('invoke a callback')
const callbacks = {
  [invoke] (key) {
    if (typeof this[key] === 'function') {
      this[key]()
    }
    this[key] = null
  }
}

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
  [types.UPDATE_MASTER_TEXT] ({ state, commit }, newText) {
    if (state.master.isSlavery) {
      commit(types.UPDATE_ALL_TEXT, newText)
    } else {
      callbacks.REQUEST_SLAVERY = () => {
        commit(types.UPDATE_ALL_TEXT, newText)
      }
      commit(types.REQUEST_SLAVERY)
    }
  }
}

export const mutations = {
  [types.UPDATE_ALL_TEXT] (state, newText) {
    state.master.text = newText
    state.twitter.text = newText
    state.weibo.text = newText
  },

  [types.UPDATE_TWITTER_TEXT] (state, newText) {
    state.twitter.text = newText
    state.isSlavery = false
  },
  [types.UPDATE_WEIBO_TEXT] (state, newText) {
    state.weibo.text = newText
    state.isSlavery = false
  },

  [types.REQUEST_SLAVERY] (state) {
    state.master.isRequestingSlavery = true
  },
  [types.REQUEST_SLAVERY_FINISH] (state, isSlavery) {
    state.master.isRequestingSlavery = false
    state.master.isSlavery = isSlavery
    if (isSlavery === true) {
      // update all text
      callbacks[invoke]('REQUEST_SLAVERY')
    }
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
