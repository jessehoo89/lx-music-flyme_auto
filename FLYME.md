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

签名：release 默认使用仓库自带的 `android/app/debug.keystore`
（storePassword / keyPassword `android`，alias `androiddebugkey`），便于与官方版共存并
持续覆盖升级。正式分发时请用 `-PMYAPP_UPLOAD_STORE_FILE=...` 等参数提供自己的签名。

## 当前状态（2026-11-09）

- Metro JS bundle 独立打包通过；`./gradlew assembleRelease` **BUILD SUCCESSFUL**
  （Gradle 8.8 / JDK 17 / SDK 36 / NDK 26.1.10909125 / CMake 3.22.1，635 个任务）。
- 产物 `lx-music-mobile-v1.9.2-universal.apk`，28,890,927 B，
  sha256 `96bf53c864212711…`（含「歌词链路脱离蓝牙开关」改动）；包名 `cn.toside.music.mobile.flyme`，
  versionCode 79 / versionName 1.9.2，签名 `CN=Android Debug`（仓库自带 debug.keystore）。
- **实车调试尚未进行**（当时车机不在线），上线后按下面清单验证。

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
