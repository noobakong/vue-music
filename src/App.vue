<template>
  <div id="app">
    <m-header></m-header>
    <m-tab></m-tab>
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
    <player></player>
  </div>
</template>

<script>
import MHeader from 'components/Header/m-header'
import MTab from 'components/tab/tab'
import Player from 'components/player/player'

export default {
  name: 'App',
  components: {
    MHeader,
    MTab,
    Player
  }
}
</script>

<style scoped lang="stylus">
  @import "~common/stylus/variable"
</style>
