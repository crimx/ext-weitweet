import Vue from 'vue'
import Vuex from 'vuex'
import _ from 'lodash'

import * as types from 'src/editor/store/types'
import boxesModule from 'src/editor/store/modules/boxes'

boxesModule.strict = true
var cleanState = _.cloneDeep(boxesModule.state)

Vue.use(Vuex)
var store = new Vuex.Store(boxesModule)

describe('Vue component: Boxes', function () {
  describe('Text contents in boxes', function () {
    describe('For a master box with two slave boxes', function () {
      it('should control text contents of the slave boxes by default', function () {
        store.replaceState(_.cloneDeep(cleanState))
        const newText = 'new text'
        store.dispatch(types.UPDATE_MASTER_TEXT, newText)
        expect(store.state.master.text).to.equal(newText)
        expect(store.state.twitter.text).to.equal(newText)
        expect(store.state.weibo.text).to.equal(newText)
      })
      describe('When `master.isSlavery` is false and master\'s text changes', function () {
        const oldText = 'old text'
        const newText = 'new text'
        var state = _.cloneDeep(cleanState)
        state.master.isSlavery = false
        state.master.text = oldText
        state.twitter.text = oldText
        state.weibo.text = oldText

        beforeEach(function () {
          store.replaceState(_.cloneDeep(state))
          store.dispatch(types.UPDATE_MASTER_TEXT, newText)
        })
        it('master should request control of the slave boxes', function () {
          expect(store.state.master.isRequestingSlavery).to.be.true
        })
        it('all text contents remain the same before callback', function () {
          expect(store.state.master.text).to.equal(oldText)
          expect(store.state.twitter.text).to.equal(oldText)
          expect(store.state.weibo.text).to.equal(oldText)
        })
        it('should change all text contents when callback with true for slavery', function () {
          store.commit(types.REQUEST_SLAVERY_FINISH, true)
          expect(store.state.master.isSlavery).to.be.true
          expect(store.state.master.isRequestingSlavery).to.be.false
          expect(store.state.master.text).to.equal(newText)
          expect(store.state.twitter.text).to.equal(newText)
          expect(store.state.weibo.text).to.equal(newText)
        })
        it('should keep all text contents when callback with false for slavery', function () {
          store.commit(types.REQUEST_SLAVERY_FINISH, false)
          expect(store.state.master.isSlavery).to.be.false
          expect(store.state.master.isRequestingSlavery).to.be.false
          expect(store.state.master.text).to.equal(oldText)
          expect(store.state.twitter.text).to.equal(oldText)
          expect(store.state.weibo.text).to.equal(oldText)
        })
      })
    })
  })
})
