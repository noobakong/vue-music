<template>
  <div id="app">
    <m-header></m-header>
    <m-tab></m-tab>
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
  </div>
</template>

<script>
import MHeader from 'components/Header/m-header'
import MTab from 'components/tab/tab'
export default {
  name: 'App',
  components: {
    MHeader,
    MTab
  }
}
</script>

<style scoped lang="stylus">
  @import "~common/stylus/variable"
</style>
