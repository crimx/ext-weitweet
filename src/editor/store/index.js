import Vue from 'vue'
import Vuex from 'vuex'
import state from './state'
import mutations from './mutations'
import actions from './actions'
import getters from './getters'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

const store = new Vuex.Store({
  state,
  mutations,
  actions,
  getters,
  strict: debug
})

if (module.hot) {
  module.hot.accept([
    './state',
    './mutations',
    './getters',
    './actions'
  ], () => {
    store.hotUpdate({
      state: require('./state'),
      mutations: require('./mutations'),
      actions: require('./actions'),
      getters: require('./getters')
    })
  })
}

export default store
