import Vue from 'vue'
const Editor = require('./Editor')

/* eslint-disable no-new */
new Vue({
  el: '#app',
  template: '<Editor/>',
  components: { Editor }
})
