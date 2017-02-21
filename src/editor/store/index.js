import Vue from 'vue'
import Vuex from 'vuex'
import * as actions from './actions'
import * as getters from './getters'
import boxes from './modules/boxes'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

const store = new Vuex.Store({
  actions,
  getters,
  modules: {
    boxes
  },
  strict: debug
})

if (module.hot) {
  module.hot.accept([
    './getters',
    './actions',
    './modules/boxes'
  ], () => {
    store.hotUpdate({
      actions: require('./actions'),
      getters: require('./getters'),
      modules: {
        boxes: require('./modules/boxes')
      }
    })
  })
}

export default store
