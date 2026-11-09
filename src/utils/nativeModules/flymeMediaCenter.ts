import { NativeEventEmitter, NativeModules, Platform } from 'react-native'

// 对应原生 FlymeMediaCenterModule.getName() = "FlymeMediaCenter"
const mod = NativeModules.FlymeMediaCenter
const available = Platform.OS === 'android' && !!mod

export interface FlymePlayState {
  title: string
  artist: string
  album: string
  artwork: string
  duration: number
  position: number
  playing: boolean
  lyric?: string
  lyricLine?: string
}

let emitter: NativeEventEmitter | null = null

export const flymeMediaCenter = {
  available,

  init() {
    if (!available) return
    mod.init()
  },

  updateState(state: FlymePlayState) {
    if (!available) return
    mod.updateState(state)
  },

  updateLyric(lyric: string) {
    if (!available) return
    mod.updateLyric(lyric)
  },

  updateProgress(position: number) {
    if (!available) return
    mod.updateProgress(position)
  },

  /** 媒体中心下发的播放/暂停/上一首/下一首。返回取消订阅函数。 */
  onAction(handler: (action: string) => void): () => void {
    if (!available) return () => {}
    if (!emitter) emitter = new NativeEventEmitter(mod)
    const sub = emitter.addListener('FlymeMediaCenterAction', (e: { action: string }) => {
      if (e && typeof e.action === 'string') handler(e.action)
    })
    return () => sub.remove()
  },
}
