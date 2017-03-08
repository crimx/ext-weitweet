import Vue from 'vue'
import Vuex from 'vuex'
import _ from 'lodash'

import * as types from 'src/editor/store/types'
import state from 'src/editor/store/state'
import mutations from 'src/editor/store/mutations'
import * as actions from 'src/editor/store/actions'
import * as getters from 'src/editor/store/getters'

var cleanState = _.cloneDeep(state)

Vue.use(Vuex)
var store = new Vuex.Store({
  state,
  mutations,
  actions,
  getters,
  strict: true
})

function genSpecs (type, map, deselect = false) {
  const srcs = [undefined, 'http://example.com/image1.jpg', 'http://example.com/image2.jpg', 'http://example.com/image3.jpg']
  Object.keys(map).forEach(beforeState => {
    const afterState = map[beforeState]
    it(`Select image${beforeState[3]} to ${type}, (${beforeState.slice(0, 3)})->(${afterState})`, function () {
      let state = _.cloneDeep(cleanState)
      state.master.photo.src = srcs[beforeState[0]]
      state.twitter.photo.src = srcs[beforeState[1]]
      state.weibo.photo.src = srcs[beforeState[2]]

      store.replaceState(state)

      expect(store.state.master.photo.src).to.equal(srcs[beforeState[0]])
      expect(store.state.twitter.photo.src).to.equal(srcs[beforeState[1]])
      expect(store.state.weibo.photo.src).to.equal(srcs[beforeState[2]])

      store.commit(types.UPDATE_PHOTO, {type, deselect, photo: {src: srcs[beforeState[3]]}})

      expect(store.state.master.photo.src).to.equal(srcs[afterState[0]])
      expect(store.state.twitter.photo.src).to.equal(srcs[afterState[1]])
      expect(store.state.weibo.photo.src).to.equal(srcs[afterState[2]])
    })
  })
}

describe('Photos selection ([before state -> after state])(state order: master, twitter, weibo)(0: unselected, [num]: photo).', function () {
  describe('Photos were select from the gallery:', function () {
    describe('To master Box:', function () {
      genSpecs('master', {
        '0001': '111',
        '0102': '222',
        '0011': '111',
        '1111': '000',
        '1112': '222'
      })
    })
    describe('To twitter Box:', function () {
      genSpecs('twitter', {
        '0001': '010',
        '0102': '020',
        '0011': '111',
        '0021': '012',
        '1111': '010',
        '1112': '021'
      })
    })
    describe('To weibo Box:', function () {
      genSpecs('weibo', {
        '0001': '001',
        '0102': '012',
        '0011': '000',
        '0021': '001',
        '1111': '001',
        '1112': '012'
      })
    })
  })
  describe('Photos were select from the box(deselect mode):', function () {
    describe('To master Box:', function () {
      genSpecs('master', {
        '1111': '000',
        '2112': '000'
      }, true)
    })
    describe('To twitter Box:', function () {
      genSpecs('twitter', {
        '1111': '001',
        '0101': '000'
      }, true)
    })
    describe('To weibo Box:', function () {
      genSpecs('weibo', {
        '1111': '010',
        '0122': '010'
      }, true)
    })
  })
})
