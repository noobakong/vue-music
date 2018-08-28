import Vue from 'vue'
import Router from 'vue-router'
import Recommend from 'components/recommend/recommend'
import Rank from 'components/rank/rank'
import Singer from 'components/singer/singer'
import Search from 'components/search/search'
import SingerDetail from 'components/singer-detail/singer-detail'
import MusicDisc from 'components/music-disc/music-disc'

Vue.use(Router) // 注册

export default new Router({
  routes: [{
      path: '/',
      redirect: '/recommend'
    }, {
      path: '/recommend',
      name: 'Recommend',
      component: Recommend,
      children: [
        {
          path: ':id',
          component: MusicDisc
        }
      ]
    }, {
      path: '/singer',
      name: 'Singer',
      component: Singer,
      children: [
        {
          path: ':id',
          component: SingerDetail
        }
      ]
    }, {
      path: '/rank',
      name: 'Rank',
      component: Rank
    }, {
      path: '/search',
      name: 'Search',
      component: Search
    }
  ]
})
