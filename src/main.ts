import Vue from 'vue'
import App from './App.vue'
import iView from 'iview'
import { MsgType, Message } from './background/types'
import i18n from 'vue-plugin-webextension-i18n'
// @ts-ignore
import VueMasonry from 'vue-masonry-css'

import 'iview/dist/styles/iview.css'

Vue.config.productionTip = false

Vue.use(i18n)
Vue.use(iView)
Vue.use(VueMasonry)

Vue.directive('focus', {
  inserted: function (el) {
    el.focus()
  }
})

new Vue({
  render: h => h(App)
}).$mount('#app')

browser.runtime.onMessage.addListener((data: Partial<Message>) => {
  if (data.type === MsgType.ExtractorReady) {
    return Promise.resolve(true)
  }
})
