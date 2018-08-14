<template>
  <div class="slider" ref="slider">
    <div class="slider-group" ref="sliderGroup">
      <slot>
      </slot>
    </div>
    <div class="dots">
      <span
        class="dot"
        v-for="(item,index) of dots"
        :key="index"
        :class="{active:currentPageIndex === index}"
      >
      </span>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  import BScroll from 'better-scroll' // 引入BS
  import {addClass} from 'common/js/dom'
  export default {
    data () {
      return {
        dots: [],
        currentPageIndex: 0
      }
    },
    props: {
      loop: { // 是否无缝轮播
        type: Boolean,
        default: true
      },
      autoplay: { // 自动轮播
        type: Boolean,
        default: true
      },
      interval: { // 轮播间隔
        type: Number,
        default: 4000
      }
    },
    mounted () {
      setTimeout(() => { // 浏览器17ms刷新一次， 这里延迟20ms 确保组件已经渲染完成
        this._setSliderWidth() // 设置slider宽度
        this._initDots() // 初始话dots
        this._initSlider() // 初始化slider
      }, 20)

      if (this.autoplay) {
        this._play()
      }

      window.addEventListener('resize', () => {
        if (!this.slider) { // slider还没有初始化的时候
          return
        }
        this._setSliderWidth(true)
        this.slider.refresh()
      })
    },
    methods: {
      _setSliderWidth(isResize) {
        this.children = this.$refs.sliderGroup.children

        let width = 0
        let sliderWidth = this.$refs.slider.clientWidth
        for (let i = 0; i < this.children.length; i++) {
          let child = this.children[i]
          addClass(child, 'slider-item') // common>js>dom.js
          child.style.width = sliderWidth + 'px' // 每个子元素的宽度就是父元素的宽度
          width += sliderWidth
        }

        if (this.loop && !isResize) {
          width += 2 * sliderWidth // 因为如果是loop无限滚动，会在左右两个地方各克隆一个dom
        }
        this.$refs.sliderGroup.style.width = width + 'px'
      },
      _initDots() {
        this.dots = new Array(this.children.length)
      },
      _initSlider() { // 初始化better-scroll来实现slider
        console.log(this.loop)
        this.slider = new BScroll(this.$refs.slider, {
          scrollX: true,
          scrollY: false,
          momentum: false,
          snap: true, // 在新版本的bs中，snap集合成了一个对象配置
          snapLoop: this.loop,
          snapThreshold: 0.3,
          snapSpeed: 400
        })
        this.slider.on('scrollEnd', () => {
          let pageIndex = this.slider.getCurrentPage().pageX
          if (this.loop) {
            pageIndex -= 1 // 前面多拷贝一个
            this.currentPageIndex = pageIndex
            if (this.autoplay) {
              clearTimeout(this.timer)
              this._play()
            }
          }
        })
      },
      _play () {
        let pageIndex = this.currentPageIndex + 1
        if (this.loop) {
          pageIndex += 1
        }
        this.timer = setTimeout(() => {
          this.slider.goToPage(pageIndex, 0, 400)
        }, this.interval)
      }
    },
    destroyed() {
      clearTimeout(this.timer) // 性能优化小习惯
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .slider
    min-height: 1px
    .slider-group
      position: relative
      overflow: hidden
      white-space: nowrap
      .slider-item
        float: left
        box-sizing: border-box
        overflow: hidden
        text-align: center
        a
          display: block
          width: 100%
          overflow: hidden
          text-decoration: none
        img
          display: block
          width: 100%
    .dots
      position: absolute
      right: 0
      left: 0
      bottom: 12px
      text-align: center
      font-size: 0
      .dot
        display: inline-block
        margin: 0 4px
        width: 8px
        height: 8px
        border-radius: 50%
        background: $color-text-l
        &.active
          width: 20px
          border-radius: 5px
          background: $color-text-ll
</style>