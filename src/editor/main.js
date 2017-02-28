import Vue from 'vue'
import store from './store'
import editor from './editor'

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  template: '<editor/>',
  components: {
    editor
  }
})
