import Vue from 'vue'
import store from './store'
import Editor from './editor'

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  template: '<editor/>',
  components: {
    editor: Editor
  }
})
