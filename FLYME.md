# LX Music 车机版（flyme_auto）

本仓库是 [LX Music Mobile](https://github.com/lyswhut/lx-music-mobile) **v1.9.2**（tag `v1.9.2`, `0669d1b`）的派生版本，
目标是让 LX Music **独立**接入吉利 / 领克（Flyme Auto）车机的媒体中心，不再需要额外的「车机助手」App 中转。

## 与上游的关系

- 上游代码与版权归原作者所有，许可为 **Apache-2.0**；本仓库保留 `LICENSE` 与全部版权声明。
- 本仓库新增的适配代码同样以 Apache-2.0 提供。
- 这是面向特定车机的定制分支，不会向上游合并。

## 主要改动

### 1. 独立接入媒体中心

此前车机助手通过订阅 LX Music 的 `MediaSession` 间接取数，数据在 RN JS 层经过
500ms 防抖、Bridge 往返与 Glide 解码后才对外可见，封面与播放状态存在明显延迟。

现在把通信层直接内置到 LX Music：

- Android 层新增 `cn.toside.music.mobile.car` 包，使用 Android 公开 API 直接实现
  与车机媒体中心的传输、注册、数据上行、恢复回调与音源条目写回。
- 新增 RN 原生模块 `FlymeMediaCenterModule`，暴露
  `init` / `updateState` / `updateLyric` / `updateProgress`，并通过
  `FlymeMediaCenterAction` 事件把媒体中心下发的播放控制动作交给 RN。
- RN 层 `src/core/init/flymeMediaCenter.ts` 直接读取 `playerState` 的一手数据，
  订阅 `global.state_event` 的曲目 / 播放态 / 进度与 `global.app_event` 的
  封面 / 歌词事件；控制动作分发到 `play` / `pause` / `playNext` / `playPrev`。

数据不再绕行 `MediaSession`，延迟与状态抖动随之消除。

### 2. 车机 UI 尺寸适配

`src/utils/pixelRatio.ts` 上游把文字缩放限制在 1.3 倍、图标与容器限制在 3.1 倍，
在低密度大屏上车机上会出现「图标过大、文字偏小」。
车机版在大屏低密度设备（短边 ≥ 600dp 且 pixelRatio ≤ 1.5）上把两者收敛到
2.2 / 2.6 倍；手机端行为不变。

### 3. 取消桌面歌词

桌面歌词悬浮窗在车机上无法正常使用，已移除设置页入口、播放详情页开关与初始化时的
启动逻辑。歌词**数据通道**（`LyricModule` 的歌词行事件与蓝牙歌词设置）保留，
因为媒体中心的歌词显示依赖它。

## 包名与安装

`applicationId` 改为 `cn.toside.music.mobile.flyme`，可以与官方版共存、随时回退。
两者数据目录互相独立，首次使用需要重新导入歌单。

> 注意：换包名后需要在车机媒体中心的音源列表里重新选择一次本应用。

## 许可

Apache License 2.0，详见 `LICENSE`。

## 编译

前置环境（本项目在 NAS 上实测通过）：

- Node.js 18+ 与 npm（`.nvmrc` 指定 v18，实测 Node 22 也可用）
- JDK 17
- Android SDK：`platforms;android-36`（compileSdk 36）、`build-tools;35.0.0`、
  `ndk;26.1.10909125`、`cmake;3.22.1`（多个 RN 依赖含 C++ 代码，缺 NDK 会在配置阶段报
  `LicenceNotAcceptedException`；`android/build.gradle` 固定了 ndkVersion）
- Gradle 8.8（仓库自带 wrapper，首次运行自动下载）

```bash
npm install --no-audit --no-fund
cd android
# 用 sdkmanager 装好 SDK 后，写入本机路径（不要提交这个文件）：
echo "sdk.dir=/path/to/your/android/sdk" > local.properties
./gradlew assembleRelease
```

产物在 `android/app/build/outputs/apk/release/`。`assembleRelease` 会自动调用 Metro
打包 JS，因此不需要预先手工执行 `react-native bundle`。

签名：优先使用 `~/.gradle/gradle.properties` 里的 `MYAPP_UPLOAD_*` 属性指向的项目自建
keystore（该文件与属性均不入库）；属性缺失时回退到仓库自带的 `android/app/debug.keystore`
（密码 `android` / alias `androiddebugkey`），那条路径仅供本地验证。

> **公开分发必须用自建 keystore。** `debug.keystore` 是 Android 公开的默认调试密钥，私钥人人都有，
> 用它签出的包任何人都能做出一模一样签名的「升级包」。
>
> 当前正式签名：`CN=LX Music Car Edition, O=jessehoo89`，
> SHA256 `54:B6:A7:91:8B:6E:79:8D:93:36:46:75:70:9E:C9:BA:09:1C:F1:9C:D5:A8:FC:34:E3:6C:3E:D8:11:59:7E:C7`。
> 与旧的 debug 签名不兼容，从旧版升级需先卸载（会清空本地歌单与设置）。

## 当前状态（2026-11-10）

- `./gradlew assembleRelease` **BUILD SUCCESSFUL**（Gradle 8.8 / JDK 17 / SDK 36 / NDK 26.1.10909125 / CMake 3.22.1）。
- 产物 `dist/lx-music-flyme_auto-1.9.2-universal.apk`，28,891,984 B，
  sha256 `c73539e5bf41aa0d…`（含第一至第五轮全部改动）；
  包名 `cn.toside.music.mobile.flyme`，versionCode 79 / versionName 1.9.2，
  签名 `CN=LX Music Car Edition`（项目自建 keystore，见「编译」一节的签名说明）。
- `./node_modules/.bin/tsc --noEmit` 保持上游基线 11 处报错，本分支改动**零新增**。
- **2026-11-09 实车验证通过**：首次播放不再被电池优化 / 通知权限弹窗阻塞、在线导入自定义源输入栏可见、
  媒体中心音源不再长时间停在「加载中」。
- **2026-11-10 实车验证通过**：第一至第五轮 UI 改动逐项截图确认（搜索页排布、播放条高度、
  歌单详情左边栏与返回键、排行榜单列与左栏宽度），关于页文案亦已在车上核对。
- **2026-11-10 换用自建证书签名并发首个 Release**（tag `v1.9.2-car.1`）：`apksigner` 校验
  `CN=LX Music Car Edition` / SHA-256 `54b6a791…` 通过。因签名与旧的 debug 版不兼容，
  车上需先卸载旧版再装（歌单与设置会清空）。

## 实机验证清单

1. 安装：`adb install --user 12 -r <universal.apk>`；与官方版共存，数据目录独立。
2. 首次启动后在媒体中心音源列表里重新选择本应用（包名已变）。
3. 确认日志 tag `CarProxy` 出现 `registerInMusic(19)`、`requestPlay=true`、
   `[nup] push 完成`、音源条目写回 `含本应用=true`。
4. 播放中检查 HUD 歌词、封面、进度、播放/暂停图标是否随 RN 事件即时更新。
5. 媒体中心与方向盘 / 手扶箱按键：play / pause / next / previous 是否落到LX Music。
6. 切到别的音源再切回：验证 `RecoverReceiver` 能否重新注册并续播。
7. 若音源列表仍按旧包名 `cn.toside.music.mobile` 索引，调整 `ProxyConfig.DEFAULT_TARGET`。

## 歌词与蓝牙歌词开关

上游的两个设置 **不再是媒体中心显示歌词的前提**，可以保持关闭：

- **显示完整蓝牙歌词**（`player.isShowBluetoothFullLyric`）：只控制
  `core/lyric.ts` 里的 `updateNowPlayingTitles({ lyric })`，即把整篇 LRC 写进
  MediaSession 的 `android.media.metadata.LYRICS` 自定义字段。旧的「车机助手」
  只能从 MediaSession 读歌词，所以必须打开它；本版本直接从
  `playerState.musicInfo.lrc`（播放时由 `getLyricInfo()` 无条件填充）取数，
  经 `FlymeMediaCenterModule.updateLyric` → `updateCurrentLyric` 送给媒体中心，
  完全不经过 MediaSession。
- **显示蓝牙歌词**（`player.isShowBluetoothLyric`）：只控制原生 `LyricModule`
  的 `setSendLyricTextEvent`，用于蓝牙 AVRCP 逐行歌词。本版本的 HUD 单行歌词
  改为订阅 `@/plugins/lyric` 的 `addLrcPlayHook`（RN 层歌词播放器由播放事件驱动），
  再经 `updateLyricLine` 写入 `NowPlaying.lyricLine` 供车机 pull。

因此媒体中心的「整篇 LRC 滚动」与「HUD 单行歌词」都不依赖这两个开关。
若仍希望蓝牙设备或系统通知栏显示歌词，可以照旧打开，两者互不影响。

## 车机交互修复

- 屏蔽「忽略电池优化」与「通知权限」提醒：车机常供电，且本版本不读取其它 App 的
  MediaSession，不需要通知使用权。这两个弹窗原先由 `handlePlay` 以 `await` 等待，
  会阻塞首次播放初始化，导致媒体中心长时间停在「加载中」。
- 弹窗渲染：`windowSoftInputMode` 由 `adjustResize` 改为 `adjustPan`；`Dialog` 不再按
  键盘高度二次压缩弹窗；`Modal` 关闭硬件加速（透明层在超宽屏上会出现竖条纹撕裂）。
  修复首次打开「在线导入自定义源」时输入栏不可见的问题。
- 首次注册后在 0.8s / 2.5s 各补推一次状态与歌词，避免车机把音源缓存成「加载中」。

## 车机 UI 布局修复（第二轮）

文字缩放上限提高后，多处沿用手机时代的固定高度 / 宽度导致换行与截断。本轮按「让布局随文字自适应」统一处理：

- **设置菜单选中符号**：`NavList` 的图标加 `flexShrink: 0`、去掉 `listName` 的 `height: '100%'`、行高改由 `getTextSize(16)` 共同决定，保证 `>` 与选项文本同行。
- **歌名 / 歌手之间的空白行**：`OnlineList/ListItem`（搜索结果、排行榜）、`Mylist/MusicList/ListItem`、`PlayDetail` 两个 Header 的 `itemInfo` / `titleContent` 由竖排改成 `flexDirection: 'row'` + `flexWrap: 'nowrap'`，车机宽屏下一行显示，彻底消除两行间距；歌名 `flexShrink: 1` 避免挤压。
- **搜索页头部**：`searchBar` 固定 `height: 38` 改 `minHeight` 并居中，输入框 `height: 32` 改 `minHeight`，源标签与搜索选项不再被压到不同行。
- **排行榜左栏**：删除不参与缩放的 `maxWidth: 180`（这是宽度被顶死的直接原因），`minWidth` 提到 160（会随 `scaleSizeW` 放大），榜单名去掉 `numberOfLines={1}`；字号继续调大也不会截断。
- **字体大小预览**：`preview.height: 45` 改 `minHeight`，预览文字按字号自然撑高。
- **关于页**：新增本项目介绍（车机独立适配版、内置媒体中心接入、Apache-2.0、基于上游 v1.9.2）与源码地址，版本号读 `process.versions.app`。
- 设置页主内容区 `flex: 0` 改 `flex: 1` + `minWidth: 0`，避免大字号下右侧内容被挤窄。

## 车机 UI 修复（第三轮）

1. **列表选中符号下沉**：排行榜左栏 `BoardsList/ListItem` 与设置菜单 `NavList` 原来用 IcoMoon 图标字体的
   `chevron-right`，图标字形贴在基线附近、行框又比字形高，`>` 整体掉到文字下方（图标字体度量与系统字体的
   基线不同，靠 `alignItems: 'center'` 居中盒子修正不了）。改为把 `›` 写进同一段 `Text`
   （嵌套 `Text` 只改颜色），基线与歌名天然一致，也不再依赖图标字体度量。
2. **歌单详情页缺返回按钮**：`SonglistDetail/Header` 顶部补一条 `navBar`（`scaleSizeH(36)` 高），
   左侧 `<` 调 `pop(commonState.componentIds.songlistDetail)`，与播放详情页返回按钮同一套写法。
3. **播放详情标题主次不分**：歌名 `size` 14 → 16，歌手保持 12 号 `c-font-label` 灰、间距 8 → 12，
   与排行榜列表「歌名 + 灰色歌手」的层次对齐；竖屏 `PlayDetail/Vertical` 同步。

## 车机 UI 修复（第四轮）

1. **歌单详情返回键并进封面行**：第三轮补的 `navBar` 会让 `<` 独占一条，把封面和歌名整体推下去。
   改为删掉 `navBar`，`Header` 用 `flexDirection: 'row'` + `alignItems: 'center'`，`<` 在最左、
   与封面 / 歌单名 / 介绍同行居中。
2. **歌单详情补左侧导航栏**：横屏时在 `SonglistDetail/index.tsx` 复用主界面的 `Home/Horizontal/Aside`，
   `Aside` 增加可选 `onNavigate` 回调；点菜单时先 `pop(commonState.componentIds.songlistDetail)`
   再 `setNavActiveId`，否则会停在详情页。
3. **排行榜左栏收窄**：`26%` → `17%`，并加 460px 上限（2560 面板约 660px → 435px）。
   榜单名 `numberOfLines={1}` + `ellipsizeMode`，不再换行撑高。
4. **排行榜列数抖动**：`getRowInfo` 按 `width / height >= 1.8` 判定两列，而车机面板比例会在
   2560×1464（1.75）与 5120×1600（3.2）之间摆，于是「切到我的列表再切回」就翻一次列数。
   改为按绝对宽度判定：`medium` 类型下 `width < 1600 && ratio >= 1.8` 才两列，车机固定单列，
   与尺寸来源无关。顺带修掉 `windowSizeTools` 未初始化时判成单列的问题。
5. **热门搜索被压塌**：`HotSearch.tsx` 外层 `BlankView` 已是 `ScrollView`，内层又套一层
   `ScrollView`，纵向嵌套无固定高度被压到只剩一行半。改回普通 `View`（`HistorySearch` 本来就是这么写的），
   标签随内容完整展开。

## 车机 UI 修复（第五轮）

1. **搜索栏顶到最上方**：横屏导航到 `nav_search` 时 `Home/Horizontal/Header` 只保留 `statusBarHeight`、
   不再画「搜索」标题行；原来在标题行的「歌曲 / 歌单」类型切换挪到 `Search/HeaderBar` 右侧。
   `BlankView` 顺序改为历史搜索在前、热门搜索在后相邻排列。
2. **搜索页整块被挤没（两次回归，根因不同）**——
   - 第一次：给类型切换容器写 `alignSelf: 'stretch'`，父高 auto 时按「可用满高」解析，整条搜索栏吃掉全部高度。
   - 第二次（真根因）：复用来的搜索类型选择器容器写死 `height: '100%'`。它在原来的固定高度头部里没问题，
     挪进父高 auto 的搜索栏后，`100%` 被解析成整块可用高度 —— `uiautomator dump` 实测该行高
     **852**，其中选择器 `[2302,0-2534,1313]`，而内容区总共才 1219，下面全部被挤到 0。
   - 修法：给选择器加 `autoHeight` 开关（`flexGrow: 0 / flexShrink: 0`，按内容撑开）；
     `HeaderBar.searchBar` 由 `minHeight: 38` 改成确定 `height: scaleSizeH(40)` + `flexGrow: 0`。
3. **播放条被撑到 2 倍高**：`PlayerBar` 容器本已有 `height: '100%'`，再叠 `justifyContent: 'center'`
   会按「可用满高」解析，把主列表挤扁。撤掉该组合。
4. **播放条偏高**：专辑图 46 → 40、`paddingVertical` 5 → 2、`PlayInfo.maxHeight` 32 → 18，
   收掉标题与进度条之间的空白；整条高度与专辑图基本相等（实测约 55px vs 54px）。

> 通用结论：车机横排工具栏一律给**确定高度**（`height: scaleSizeH(n)` + `flexGrow: 0`）。
> `height: '100%'` / `alignSelf: 'stretch'` / `justifyContent: 'center'` 写在父高 auto 的横排容器上，
> 都会按「可用满高」解析。详见 `viking://resources/03-技术知识-wiki/RN车机横排工具栏必须定高.md`。
