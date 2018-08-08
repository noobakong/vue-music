import 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import router from './router'
import fastClick from 'fastclick'
import 'common/stylus/index.styl' // 引入项目结构样式

fastClick.attach(document.body)
Vue.config.productionTip = false
/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App),
  router
})
