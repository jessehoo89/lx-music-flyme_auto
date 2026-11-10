import { useEffect, useRef } from 'react'
import { View } from 'react-native'

import MusicList, { type MusicListType } from './MusicList'
import PageContent from '@/components/PageContent'
import StatusBar from '@/components/common/StatusBar'
import { setComponentId, setNavActiveId } from '@/core/common'
import { COMPONENT_IDS } from '@/config/constant'
import { type ListInfoItem } from '@/store/songlist/state'
import PlayerBar from '@/components/player/PlayerBar'
import { ListInfoContext } from './state'
import Aside from '@/screens/Home/Horizontal/Aside'
import { useHorizontalMode } from '@/utils/hooks'
import { pop } from '@/navigation'
import commonState from '@/store/common/state'
import type { InitState } from '@/store/common/state'
import { createStyle } from '@/utils/tools'


export default ({ componentId, info }: { componentId: string, info: ListInfoItem }) => {
  const musicListRef = useRef<MusicListType>(null)
  const isUnmountedRef = useRef(false)
  const isHorizontalMode = useHorizontalMode()

  useEffect(() => {
    setComponentId(COMPONENT_IDS.songlistDetail, componentId)

    isUnmountedRef.current = false

    musicListRef.current?.loadList(info.source, info.id)


    return () => {
      isUnmountedRef.current = true
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  // 左边栏与主界面一致：点了菜单先退出歌单详情，再切换主界面的栏目
  const handleNavigate = (id: InitState['navActiveId']) => {
    void pop(commonState.componentIds.songlistDetail!)
    requestAnimationFrame(() => {
      setNavActiveId(id)
    })
  }

  return (
    <PageContent>
      <StatusBar />
      <View style={styles.container}>
        {
          // 只有横屏（车机 / 平板）才加左边栏，手机竖屏保持原样
          isHorizontalMode ? <Aside onNavigate={handleNavigate} /> : null
        }
        <View style={styles.content}>
          <ListInfoContext.Provider value={info}>
            <MusicList ref={musicListRef} componentId={componentId} />
          </ListInfoContext.Provider>
          <PlayerBar />
        </View>
      </View>
    </PageContent>
  )
}

const styles = createStyle({
  container: {
    width: '100%',
    flex: 1,
    flexDirection: 'row',
  },
  content: {
    flex: 1,
    overflow: 'hidden',
  },
})
