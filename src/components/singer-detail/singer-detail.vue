<template>
  <transition name="slide">
    <music-list :songs="songs" :title="title" :bg-image="bgImage"></music-list>
  </transition>
</template>

<script>
import {mapGetters} from 'vuex'
import {getSingerDetail, getSongVkey} from 'api/singer'
import {ERR_OK} from 'api/config'
import {createSong} from 'common/js/song'
import MusicList from 'components/music-list/music-list'

export default {
  data() {
    return {
      songs: []
    }
  },
  computed: {
    title () {
      return this.singer.name
    },
    bgImage() {
      return this.singer.avatar
    },
    ...mapGetters([
      'singer' // 把 `this.signer` 映射为 `this.$store.getters.singer`
    ])
  },
  created() {
    this._getDetail()
  },
  components: {
    MusicList
  },
  methods: {
    _getDetail() {
      if (!this.singer.id) {
        this.$router.push('/singer')
      }
      getSingerDetail(this.singer.id).then((res) => {
        if (res.code === ERR_OK) {
          this.songs = this._normalizeSongs(res.data.list)
        }
      })
    },
    _normalizeSongs(list) {
      let ret = []
      list.forEach((item) => {
        let {musicData} = item
          getSongVkey(musicData.songmid).then((res) => {
            // console.log('这首歌的vkey获取到了')
            // console.log(res.data)
            const vkey = res.data.items[0].vkey
            if (musicData.songid && musicData.albummid) {
              ret.push(createSong(musicData, vkey))
            }
          }, (e) => {
            console.log(e)
          })
      })
      return ret
    }
  }
}
</script>

<style scoped lang="stylus">
  @import "~common/stylus/variable"
  .slide-enter-active, .slide-leave-active
    transition: all 0.3s
  .slide-enter, .slide-leave-to
    transform: translate3d( 0, 100%, 0)
</style>
