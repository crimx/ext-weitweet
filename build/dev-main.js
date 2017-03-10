/**
 * For development only. With some nasty hacks.
 */
import Vue from 'vue'
// import store from 'src/editor/store'
import comp from 'src/editor/editor'

import Vuex from 'vuex'
import state from 'src/editor/store/state'
import mutations from 'src/editor/store/mutations'
import actions from 'src/editor/store/actions'
import getters from 'src/editor/store/getters'
import messages from 'src/_locales/zh_CN/messages.json'

fakeChrome()

var store = fakeStore()

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  template: '<comp/>',
  components: {
    comp
  }
})

function fakeStore () {
  state.twitter.accessToken = 'sdsds'
  state.twitter.avatar = 'https://pbs.twimg.com/profile_images/836704199672999936/TZAu8Aoi_bigger.jpg'
  state.twitter.fullname = 'zeldman‏'
  state.twitter.username = 'zeldman'

  state.weibo.accessToken = 'balbbalaa'
  state.weibo.avatar = 'https://pbs.twimg.com/profile_images/836704199672999936/TZAu8Aoi_bigger.jpg'
  state.weibo.fullname = '一天世界'
  state.weibo.username = '一天世界'


  Object.keys(messages).forEach(m => {
    getters[m] = () => messages[m].message
  })

  Vue.use(Vuex)

  var store = new Vuex.Store({
    state,
    mutations,
    actions,
    getters,
    strict: true
  })

  if (module.hot) {
    module.hot.accept([
      'src/editor/store/state',
      'src/editor/store/mutations',
      'src/editor/store/getters',
      'src/editor/store/actions'
    ], () => {
      store.hotUpdate({
        state: require('src/editor/store/state'),
        mutations: require('src/editor/store/mutations'),
        actions: require('src/editor/store/actions'),
        getters: require('src/editor/store/getters')
      })
    })
  }

  return store
}

function fakeChrome () {
  var msgList = []
  window.chrome = {
    runtime: {
      sendMessage: sendMessage,
      onMessage: {
        addListener (cb) {
          if (typeof cb === 'function') {
            msgList.push(cb)
          }
        }
      }
    },
    tabs: {
      sendMessage: sendMessage
    },
    storage: {
      local: {
        get: function () {},
        set: function () {}
      }
    }
  }

  function sendMessage () {
    let args = Array.from(arguments)
    let message = args[0]
    if (typeof args[0] === 'string') {
      message = args[1]
    }
    if (message.msg === 'REQUEST_SOURCE_TAB') {
      if (typeof args[args.length - 1] === 'function') {
        args[args.length - 1]({tab: {id: 'sdsdsds'}})
      }
    } else if (message.msg === 'REQUEST_PHOTOS') {
      msgList.forEach(msg => {
        msg({
          msg: 'PHOTOS',
          photos: [
            {src: 'http://ww1.sinaimg.cn/mw690/6a4475c9jw1fdd243oqm3j20xf0dvdm9.jpg'},
            {src: 'http://ww1.sinaimg.cn/mw690/6a4475c9jw1fdd247spp4j20rs0kumyd.jpg'},
            {src: 'http://wx2.sinaimg.cn/mw690/a180de74ly1fdd1qy8nlej20c80nmae7.jpg'},
            {src: 'http://wx3.sinaimg.cn/mw690/005trlAagy1fdd22msenoj31kw11xjw2.jpg'},
            {src: 'http://wx1.sinaimg.cn/mw690/a180de74ly1fdd1qyzzvvj20c811tter.jpg'},
            {src: 'http://ww1.sinaimg.cn/mw690/6a4475c9jw1fdd246v35bj20xi0dxmzh.jpg'},
            {src: 'http://wx3.sinaimg.cn/mw690/a180de74ly1fdd1r0tcrbj20c80k20we.jpg'}
          ]
        })
      })
    }
  }
}
