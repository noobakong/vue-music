<template>
    <div class="loading">
      <img src="./loading.gif" alt="">
      <p class="desc">{{title}}</p>
    </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: '许文瑞正在吃屎。。。。'
    }
  }
}
</script>

<style scoped lang="stylus">
  @import "~common/stylus/variable"
  .loading
    width 100%
    text-align center
    .desc
      line-height 20px
      font-size $font-size-small
      color: $color-text-l
</style>
