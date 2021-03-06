import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router) // 注册
const Recommend = (resolve) => {
  import('components/recommend/recommend').then((module) => {
    resolve(module)
  })
}

const Singer = (resolve) => {
  import('components/singer/singer').then((module) => {
    resolve(module)
  })
}

const Rank = (resolve) => {
  import('components/rank/rank').then((module) => {
    resolve(module)
  })
}

const Search = (resolve) => {
  import('components/search/search').then((module) => {
    resolve(module)
  })
}

const SingerDetail = (resolve) => {
  import('components/singer-detail/singer-detail').then((module) => {
    resolve(module)
  })
}

const MusicDisc = (resolve) => {
  import('components/music-disc/music-disc').then((module) => {
    resolve(module)
  })
}

const TopListDetail = (resolve) => {
  import('components/top-list-detail/top-list-detail').then((module) => {
    resolve(module)
  })
}

const UserCenter = (resolve) => {
  import('components/user-center/user-center').then((module) => {
    resolve(module)
  })
}

// import Recommend from 'components/recommend/recommend'
// import Rank from 'components/rank/rank'
// import Singer from 'components/singer/singer'
// import Search from 'components/search/search'
// import SingerDetail from 'components/singer-detail/singer-detail'
// import MusicDisc from 'components/music-disc/music-disc'
// import TopListDetail from 'components/top-list-detail/top-list-detail'
// import UserCenter from 'components/user-center/user-center'

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
      component: Rank,
      children: [
        {
          path: ':id',
          component: TopListDetail
        }
      ]
    }, {
      path: '/search',
      name: 'Search',
      component: Search,
      children: [
        {
          path: ':id',
          component: SingerDetail
        }
      ]
    }, {
      path: '/user',
      name: 'UserCenter',
      component: UserCenter
    }
  ]
})
