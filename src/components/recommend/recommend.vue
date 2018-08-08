<template>
  <div class="recommend" ref="recommend">
    <div class="recommend-content">
      <div v-if="recommends.length" class="slider-wrapper" ref="sliderWrapper">
        <slider>
          <div v-for="(item,index) in recommends" :key="index">
            <a :href="item.linkUrl">
              <img :src="item.picUrl">
            </a>
          </div>
        </slider>
      </div>
    </div>
    <div class="recommend-list">
      <h1 class="list-title">热门歌单推荐</h1>
      <ul>
      </ul>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  import Slider from 'base/slider/slider' // 引入轮播组件
  // import Loading from 'base/loading/loading'
  // import Scroll from 'base/scroll/scroll'
  import { getRecommend } from 'api/recommend' // 获取方法
  // import {playlistMixin} from 'common/js/mixin'
  import {ERR_OK} from 'api/config' // err_ok = 0
  // import {mapMutations} from 'vuex'

  export default {
    // mixins: [playlistMixin],
    data() {
      return {
        recommends: []
        // discList: []
      }
    },
    created() { // 钩子函数获取数据
      this._getRecommend() // 调用获取推荐页面的json

      // this._getDiscList()
    },
    methods: {
      // handlePlaylist(playlist) {
      //   const bottom = playlist.length > 0 ? '60px' : ''

      //   this.$refs.recommend.style.bottom = bottom
      //   this.$refs.scroll.refresh()
      // },
      // loadImage() {
      //   if (!this.checkloaded) {
      //     this.checkloaded = true
      //     this.$refs.scroll.refresh()
      //   }
      // },
      // selectItem(item) {
      //   this.$router.push({
      //     path: `/recommend/${item.dissid}`
      //   })
      //   this.setDisc(item)
      // },
      _getRecommend() {
        getRecommend().then((res) => {
          if (res.code === ERR_OK) {
            // this.recommends = res.data.slider
            this.recommends = res.data.slider
          }
        })
      }
      // _getDiscList() {
      //   getDiscList().then((res) => {
      //     if (res.code === ERR_OK) {
      //       this.discList = res.data.list
      //     }
      //   })
      // },
      // ...mapMutations({
      //   setDisc: 'SET_DISC'
      // })
    },
    components: {
      Slider
      // Loading,
      // Scroll
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .recommend
    position: fixed
    width: 100%
    top: 88px
    bottom: 0
    .recommend-content
      height: 100%
      overflow: hidden
      .slider-wrapper
        position: relative
        width: 100%
        overflow: hidden
      .recommend-list
        .list-title
          height: 65px
          line-height: 65px
          text-align: center
          font-size: $font-size-medium
          color: $color-theme
        .item
          display: flex
          box-sizing: border-box
          align-items: center
          padding: 0 20px 20px 20px
          .icon
            flex: 0 0 60px
            width: 60px
            padding-right: 20px
          .text
            display: flex
            flex-direction: column
            justify-content: center
            flex: 1
            line-height: 20px
            overflow: hidden
            font-size: $font-size-medium
            .name
              margin-bottom: 10px
              color: $color-text
            .desc
              color: $color-text-d
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>