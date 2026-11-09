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

## 当前状态

- JS bundle 已独立打包验证通过；Android 编译进行中/见提交记录。
- **实车调试尚未进行**：车机媒体中心的音源注册包名、恢复回调、歌词与控制动作
  需要在领克 900（Flyme Auto）上实测确认。
- 换包名后音源标识变为 `cn.toside.music.mobile.flyme`，若车机音源列表仍按
  `cn.toside.music.mobile` 索引，可在 `ProxyConfig.DEFAULT_TARGET` 中调整。
