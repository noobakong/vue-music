import 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import fastClick from 'fastclick'
import VueLazyLoad from 'vue-lazyload'

import 'common/stylus/index.styl' // 引入项目结构样式

// /* eslint-disable no-unused-vars */

// import vConsole from 'vconsole'

console.log('test')
fastClick.attach(document.body)

Vue.use(VueLazyLoad, {
  loading: require('common/images/touxiang.png')
})

Vue.config.productionTip = false
/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App),
  router,
  store
})
