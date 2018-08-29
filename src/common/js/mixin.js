import {mapGetters} from 'vuex'
export const playListMixin = {
  computed: {
    ...mapGetters([
      'playList'
    ])
  },
  mounted () { // dom ready时触发
    this.handlePlayList(this.playList)
  },
  activated() { // keepalive切换时触发
    this.handlePlayList(this.playList)
  },
  watch: {
    playList(newVal) {
      this.handlePlayList(newVal)
    }
  },
  methods: {
    handlePlayList () {
      throw new Error('组件必须定义handlePlayList方法')
    }
  }
}