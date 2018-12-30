import Vue from 'vue'
import App from './App.vue'
import iView from 'iview'
import i18n from 'vue-plugin-webextension-i18n'

import 'iview/dist/styles/iview.css'

Vue.config.productionTip = false

Vue.use(i18n)
Vue.use(iView)

new Vue({
  render: h => h(App)
}).$mount('#app')
