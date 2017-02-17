import 'bootstrap/dist/css/bootstrap.css'
import Vue from 'vue'
import Editor from './Editor'

/* eslint-disable no-new */
new Vue({
  el: '#app',
  template: '<Editor/>',
  components: { Editor }
})
