import { useRef, forwardRef, useImperativeHandle } from 'react'
import { View } from 'react-native'

// import music from '@/utils/musicSdk'
import { BorderWidths } from '@/theme'
// import InsetShadow from 'react-native-inset-shadow'
import SourceSelector, {
  type SourceSelectorType as _SourceSelectorType,
  type SourceSelectorProps as _SourceSelectorProps,
} from '@/components/SourceSelector'
import SearchInput, { type SearchInputType, type SearchInputProps } from './SearchInput'
import { createStyle } from '@/utils/tools'
import { useTheme } from '@/store/theme/hook'
import { type Source as MusicSource } from '@/store/search/music/state'
import { type Source as SonglistSource } from '@/store/search/songlist/state'
import SearchTypeSelector from '../SearchTypeSelector'
import { useHorizontalMode } from '@/utils/hooks'
import { scaleSizeH } from '@/utils/pixelRatio'

type Sources = Readonly<Array<MusicSource | SonglistSource>>
type SourceSelectorProps = _SourceSelectorProps<Sources>
type SourceSelectorType = _SourceSelectorType<Sources>

export interface HeaderBarProps {
  onSourceChange: SourceSelectorProps['onSourceChange']
  onTipSearch: SearchInputProps['onChangeText']
  onSearch: SearchInputProps['onSubmit']
  onHideTipList: SearchInputProps['onBlur']
  onShowTipList: SearchInputProps['onTouchStart']
}

export interface HeaderBarType {
  setSourceList: SourceSelectorType['setSourceList']
  setText: SearchInputType['setText']
  blur: SearchInputType['blur']
}


export default forwardRef<HeaderBarType, HeaderBarProps>(({ onSourceChange, onTipSearch, onSearch, onHideTipList, onShowTipList }, ref) => {
  const sourceSelectorRef = useRef<SourceSelectorType>(null)
  const searchInputRef = useRef<SearchInputType>(null)
  const theme = useTheme()
  // 横屏（车机/平板）头部不再画标题行，类型切换放在搜索栏右侧
  const isHorizontalMode = useHorizontalMode()

  useImperativeHandle(ref, () => ({
    setSourceList(list, source) {
      sourceSelectorRef.current?.setSourceList(list, source)
    },
    setText(text) {
      searchInputRef.current?.setText(text)
    },
    blur() {
      searchInputRef.current?.blur()
    },
  }), [])


  return (
    <View style={{ ...styles.searchBar, borderBottomColor: theme['c-border-background'] }}>
      <View style={styles.selector}>
        <SourceSelector ref={sourceSelectorRef} onSourceChange={onSourceChange} center />
      </View>
      <SearchInput
        ref={searchInputRef}
        onChangeText={onTipSearch}
        onSubmit={onSearch}
        onBlur={onHideTipList}
        onTouchStart={onShowTipList}
      />
      {isHorizontalMode ? <View style={styles.typeSelector}><SearchTypeSelector autoHeight /></View> : null}
    </View>
  )
})

const styles = createStyle({
  searchBar: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    // 必须是确定高度：行内任何子项一旦按「可用高度」解析（100% / flexGrow），
    // 整行就会吃满内容区（实测被撑到 852），下面的历史/热门搜索被挤成一条缝。
    height: scaleSizeH(40),
    flexGrow: 0,
    flexShrink: 0,
    zIndex: 2,
    paddingRight: 10,
    borderBottomWidth: BorderWidths.normal,
  },
  selector: {
    flexShrink: 0,
  },
  typeSelector: {
    flexGrow: 0,
    flexShrink: 0,
    paddingLeft: 5,
    justifyContent: 'center',
  },
})
