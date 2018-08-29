<template>
  <scroll
    class="listview"
    ref="listview"
    :data="data"
    :listenScroll="listenScroll"
    :probeType="probeType"
    @scroll="scroll"
  >
    <ul>
      <li v-for="(group, index) in data" :key="index" class="list-group" ref="listGroup">
        <h2 class="list-group-title">{{group.title}}</h2>
        <ul>
          <li
            v-for="(item, index) in group.items"
            :key="index"
            class="list-group-item"
            @click="selectItem(item)"
          >
            <img v-lazy="item.avatar" class="avatar">
            <span class="name">{{item.name}}</span>
          </li>
        </ul>
      </li>
    </ul>
    <div
      class="list-shortcut"
      @touchstart="onShortcutTouchStart"
      @touchmove.stop.prevent="onShortcutTouchMove"
    >
      <ul>
        <li
          class="item"
          v-for="(item, index) in shortcutList"
          :key="index"
          :data-index="index"
          :class="{'current': currentIndex === index}"
        >
          {{item}}
        </li>
      </ul>
    </div>
    <div class="list-fixed" v-show="fixedTitle" ref="fixed">
      <h1 class="fixed-title">{{this.fixedTitle}}</h1>
    </div>
    <div v-show="!data.length" class="loading-container">
      <loading></loading>
    </div>
  </scroll>
</template>

<script>
import Scroll from 'base/scroll/scroll' // 引入scroll组件
import {getData} from 'common/js/dom'
import Loading from 'base/loading/loading'

const ANCHOR_HEIGHT = 18
const TITLE_HEIGHT = 30

export default {
  created() {
    this.touch = {} // 以供两个方法公用的数据
    this.listenScroll = true
    this.listHeight = []
    this.probeType = 3
  },
  props: {
    data: {
      type: Array
    }
  },
  data() {
    return {
      scrollY: -1, // 滚动的纵向距离
      currentIndex: 0, // 高亮的key
      diff: -1
    }
  },
  watch: {
    data() {
      setTimeout(() => { // 数据变化到dom变化有一个延迟，所以这个加一个定时器
        this._calculateHeight() // 计算每一个group的高度
      }, 20)
    },
    scrollY(newY) {
      const listHeight = this.listHeight
      // 当滚动到顶部 newY > 0
      if (newY > 0) {
        this.currentIndex = 0
        return
      }

      // 在中间部分滚动
      for (let i = 0; i < listHeight.length; i++) {
        let height1 = listHeight[i]
        let height2 = listHeight[i + 1]
        if (-newY >= height1 && -newY < height2) {
          this.currentIndex = i
          this.diff = height2 + newY // 注意 newY为负值
          return
        }
      }
      // 当滚动到底部，且-newY 大于最后一个元素的上线
      this.currentIndex = listHeight.length - 2
    },
    diff(newVal) {
      let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0
      if (this.fixedTop === fixedTop) {
        return
      }
      this.fixedTop = fixedTop
      this.$refs.fixed.style.transform = `translate3d(0,${fixedTop}px,0)`
    }
  },
  computed: {
    shortcutList() {
      return this.data.map((group) => {
        return group.title.substr(0, 1)
      })
    },
    fixedTitle() {
      if (this.scrollY > 0) {
        return ''
      }
      return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
    }
  },
  components: { // 注册组件
    Scroll,
    Loading
  },
  methods: {
    selectItem(item) {
      this.$emit('select', item) // 向外派发事件
    },
    onShortcutTouchStart(e) {
      let anchorIndex = getData(e.target, 'index') // 获取data
      let firstTouch = e.touches[0] // 刚开始触碰的位置坐标
      this.touch.y1 = firstTouch.pageY
      this.touch.anchorIndex = anchorIndex
      this._scrollTo(anchorIndex) // 通过使用_scrollTo方法来跳转到我们的字母所在位置
    },
    onShortcutTouchMove(e) { // 屏幕滑动方法 要明确开始滚动和结束滚动的两个位置，然后计算出滚动到哪一个字母
      let firstTouch = e.touches[0] // 停止滚动时的位置坐标
      this.touch.y2 = firstTouch.pageY // 保存到touch对象中
      let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0 // 计算滚动了多少个字母
      let anchorIndex = parseInt(this.touch.anchorIndex) + delta // this.touch.anchorIndex 字符串转化为整型
      this._scrollTo(anchorIndex) // 跳转到字母位置
    },
    refresh() {
      this.$refs.listview.refresh()
    },
    scroll(pos) {
      this.scrollY = pos.y
      // console.log(pos) // 测试
    },
    _scrollTo(index) {
      if (!index && index !== 0) { // 点击以外的部分 无反应
        return
      }
      if (index < 0) { // 滑动到顶部时 index为负
        index = 0
      } else if (index > this.listHeight.length - 2) { // 滑动到尾部
        index = this.listHeight.length - 2
      }
      this.scrollY = -this.listHeight[index] // 每次点击都更改scrollY以实现同步
      this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 300)
    },
    _calculateHeight() {
      this.listHeight = []
      const list = this.$refs.listGroup
      let height = 0
      this.listHeight.push(height)
      for (let i = 0; i < list.length; i++) {
        let item = list[i]
        height += item.clientHeight
        this.listHeight.push(height) // 得到一个包含每一个group高度的数组
      }
    }
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .listview
    position: relative
    width: 100%
    height: 100%
    overflow: hidden
    background: $color-background
    .list-group
      padding-bottom: 30px
      .list-group-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
      .list-group-item
        display: flex
        align-items: center
        padding: 20px 0 0 30px
        .avatar
          width: 50px
          height: 50px
          border-radius: 50%
        .name
          margin-left: 20px
          color: $color-text-l
          font-size: $font-size-medium
    .list-shortcut
      position: absolute
      z-index: 30
      right: 0
      top: 50%
      transform: translateY(-50%)
      width: 20px
      padding: 20px 0
      border-radius: 10px
      text-align: center
      background: $color-background-d
      font-family: Helvetica
      .item
        padding: 3px
        line-height: 1
        color: $color-text-l
        font-size: $font-size-small
        &.current
          color: $color-theme
    .list-fixed
      position: absolute
      top: 0
      left: 0
      width: 100%
      .fixed-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
