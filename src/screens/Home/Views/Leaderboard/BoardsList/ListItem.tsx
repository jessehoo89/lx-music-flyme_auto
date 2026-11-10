import { useCallback, useRef } from 'react'
import Text from '@/components/common/Text'
import { useTheme } from '@/store/theme/hook'
import Button, { type BtnType } from '@/components/common/Button'
import { createStyle } from '@/utils/tools'
import { type BoardItem } from '@/store/leaderboard/state'

// index={index}
// longPressIndex={longPressIndex}
// activeId={activeId}
// showMenu={showMenu}
// onBoundChange={handleBoundChange}
export interface ListItemProps {
  item: BoardItem
  index: number
  longPressIndex: number
  activeId: string
  onShowMenu: (id: string, name: string, index: number, position: { x: number, y: number, w: number, h: number }) => void
  onBoundChange: (item: BoardItem) => void
}

export default ({ item, activeId, index, longPressIndex, onBoundChange, onShowMenu }: ListItemProps) => {
  const theme = useTheme()
  const buttonRef = useRef<BtnType>(null)

  const setPosition = useCallback(() => {
    if (buttonRef.current?.measure) {
      buttonRef.current.measure((fx, fy, width, height, px, py) => {
        // console.log(fx, fy, width, height, px, py)
        onShowMenu(item.id, item.name, index, { x: Math.ceil(px), y: Math.ceil(py), w: Math.ceil(width), h: Math.ceil(height) })
      })
    }
  }, [index, item, onShowMenu])

  const active = activeId == item.id

  return (
    <Button
      ref={buttonRef}
      style={{ ...styles.button, backgroundColor: index == longPressIndex ? theme['c-button-background-active'] : undefined }}
      key={item.id} onLongPress={setPosition}
      onPress={() => { onBoundChange(item) }}
    >
      <Text style={styles.listName} size={14} numberOfLines={1} textBreakStrategy="simple" color={active ? theme['c-primary-font-active'] : theme['c-font']}>
        {/* 箭头用字符写在同一段文本里，基线与歌名一致，不会像图标字体那样下沉 */}
        {active ? <Text size={14} color={theme['c-primary-font']}>{'›  '}</Text> : null}
        {item.name}
      </Text>
    </Button>
  )
}

const styles = createStyle({
  button: {
    paddingLeft: 5,
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
  },
  listName: {
    justifyContent: 'center',
    paddingLeft: 6,
    flexShrink: 1,
    // backgroundColor: 'rgba(0,0,0,0.1)',
  },
})
