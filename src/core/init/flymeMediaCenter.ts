import { flymeMediaCenter } from '@/utils/nativeModules/flymeMediaCenter'
import playerState from '@/store/player/state'
import { addLrcPlayHook } from '@/plugins/lyric'
import { pause, play, playNext, playPrev } from '@/core/player/player'

/**
 * 让 LX Music 自己成为车机媒体中心音源。
 *
 * 播放状态、曲目、封面、歌词直接取自 playerState（落雪的一手数据），
 * 不再经过 MediaSession，也不再依赖外部车机助手进程。
 */
let isInited = false
/** 当前歌词行由 RN 层歌词播放器直接给出，不依赖「显示蓝牙歌词」开关。 */
let currentLyricLine = ''

const handleLyricLine = (_line: number, text: string) => {
  currentLyricLine = text ?? ''
  flymeMediaCenter.updateLyricLine(currentLyricLine)
}

const buildState = () => {
  const info = playerState.musicInfo
  return {
    title: info.name ?? '',
    artist: info.singer ?? '',
    album: info.album ?? '',
    artwork: info.pic ?? '',
    duration: Math.max(0, (playerState.progress.maxPlayTime || 0) * 1000),
    position: Math.max(0, (playerState.progress.nowPlayTime || 0) * 1000),
    playing: !!playerState.isPlay,
    lyric: info.lrc ?? '',
    lyricLine: currentLyricLine,
  }
}

const pushState = () => {
  flymeMediaCenter.updateState(buildState())
}

const pushProgress = () => {
  flymeMediaCenter.updateProgress(
    Math.max(0, (playerState.progress.nowPlayTime || 0) * 1000)
  )
}

const pushLyric = () => {
  flymeMediaCenter.updateLyric(playerState.musicInfo.lrc ?? '')
  pushState()
}

const handleAction = (action: string) => {
  switch (action) {
    case 'play':
      play()
      break
    case 'pause':
      void pause()
      break
    case 'next':
      void playNext()
      break
    case 'previous':
      void playPrev()
      break
    default:
      break
  }
}

export default async() => {
  if (isInited || !flymeMediaCenter.available) return
  isInited = true

  flymeMediaCenter.init()
  flymeMediaCenter.onAction(handleAction)

  // 状态总线：曲目、播放态、进度
  global.state_event.on('playerMusicInfoChanged', () => pushState())
  global.state_event.on('playMusicInfoChanged', () => pushState())
  global.state_event.on('playStateChanged', () => pushState())
  global.state_event.on('playProgressChanged', () => pushProgress())

  // 命令总线：切歌、封面异步就绪、整篇歌词就绪
  global.app_event.on('musicToggled', () => pushState())
  global.app_event.on('picUpdated', () => pushState())
  global.app_event.on('lyricUpdated', () => pushLyric())

  // 当前歌词行：订阅 RN 层歌词播放器（由 app_event.play / 进度驱动，
  // 不经过 LyricModule 的「显示蓝牙歌词」事件开关）。
  addLrcPlayHook(handleLyricLine)

  // 初始化时主动推一次全量状态，不能只等下一次事件
  pushState()
}
