<template>
  <div class="singer">
    <list-view :data="singers"></list-view>
  </div>
</template>

<script>
import {getSingerList} from 'api/singer'
import {ERR_OK} from 'api/config'
import Singer from 'common/js/singer'
import ListView from 'base/listview/listview'
const HOT_NAME = '热门'
const HOT_SINGER_LENGTH = 10

export default {
  data() {
    return {
      singers: []
    }
  },
  created() {
    this._getSingerList() // 获取数据
  },
  methods: {
    _getSingerList() { // 数据获取方法
      getSingerList().then((res) => { // success
        if (res.code === ERR_OK) {
          this.singers = this._normalizeSinger(res.data.list) // 处理后的数据
        }
      })
    },
    _normalizeSinger(list) { // 处理数据结构 形参为list
      let map = { // 把数据都存在map对象中
        hot: { // 热门城市
          title: HOT_NAME,
          items: [] // 初始化空数组
        }
      }
      list.forEach((item, index) => { // 循环数组中的每一项
        if (index < HOT_SINGER_LENGTH) { // 因为原始数据是按照热度排列的，所以获取前十的热门
          map.hot.items.push(new Singer({ // push到我们的hot数组中
          // new Singer: 为了模块化和减少代码的复用，我们在common > js 创建了一个singer.js
          // 来创建一个类构造器 里面包括歌手头像的拼接
            id: item.Fsinger_mid,
            name: item.Fsinger_name
          }))
        }
        const key = item.Findex // 歌手姓氏字首字母
        if (!map[key]) { // 如果不存在
          map[key] = { // 创建
            title: key,
            items: []
          }
        }
        map[key].items.push(new Singer({ // 追加到map.items中
          id: item.Fsinger_mid,
          name: item.Fsinger_name
        }))
      })

      // 为了得到有序列表 我们需要处理map
      let hot = [] // 热门城市
      let ret = [] // 字母表城市
      for (let key in map) { // 循环
        let val = map[key]
        if (val.title.match(/[a-zA-Z]/)) { // 正则匹配字母
          ret.push(val)
        } else if (val.title === HOT_NAME) {
          hot.push(val) // 热门城市
        }
      }
      ret.sort((a, b) => {
        return a.title.charCodeAt(0) - b.title.charCodeAt(0) // 把字母城市按charcode字母排序
      })

      return hot.concat(ret) // 将字母城市追加到hot城市 返回给外部
    }
  },
  components: {
    ListView
  }
}
</script>

<style scoped lang="stylus">
  .singer
    position fixed
    top 88px
    bottom 0
    width 100%
</style>
