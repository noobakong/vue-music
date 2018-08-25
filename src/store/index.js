import Vue from 'vue'
import Vuex from 'vuex'
import * as actions from './actions'
import * as getters from './getters'
import state from './state'
import mutations from './mutations'
import createLogger from 'vuex/dist/logger'

Vue.use(Vuex) // 注册插件

const debug = process.env.NODE_ENV !== 'production' // 线下调试的时候 debug 为 ture

export default new Vuex.Store({ // new一个实例
  actions,
  getters,
  state,
  mutations,
  strict: debug, // 开启严格模式，用于下面来控制是否开启插件
  plugins: debug ? [createLogger()] : [] // 开启插件
})