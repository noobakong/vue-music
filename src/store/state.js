import {playMode} from 'common/js/config'
const state = {
  singer: {},
  playing: false, // 播放
  fullScreen: false, // 全屏
  playList: [], // 播放列表 播放模式不同 列表不同
  sequenceList: [], // 顺序列表
  mode: playMode.sequence, // 默认顺序播放
  currentIndex: -1,
  disc: {}, // 推荐页面歌单详情
  topList: []
}

export default state