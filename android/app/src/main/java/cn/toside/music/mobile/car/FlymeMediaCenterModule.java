package cn.toside.music.mobile.car;

import android.os.Handler;
import android.os.Looper;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

/**
 * LX Music 自己的 RN 层与车机媒体中心之间的桥。
 *
 * 播放状态、曲目、封面、歌词由落雪的播放事件直接送进来，不经过 MediaSession，
 * 也不再需要外部车机助手进程。
 */
public class FlymeMediaCenterModule extends ReactContextBaseJavaModule {

    public static final String EVENT_ACTION = "FlymeMediaCenterAction";
    private static volatile FlymeMediaCenterModule instance;
    /** 冷启动时车机可能先发恢复广播、RN 桥后就绪，先把播放意图存下来。 */
    private static volatile boolean pendingPlay;
    private final ReactApplicationContext reactContext;

    public FlymeMediaCenterModule(ReactApplicationContext ctx) {
        super(ctx);
        reactContext = ctx;
        instance = this;
    }

    @NonNull
    @Override
    public String getName() {
        return "FlymeMediaCenter";
    }

    /** 车机恢复音源：桥已就绪就直接发，否则等 init 时补发。 */
    public static void requestPlayOnReady() {
        pendingPlay = true;
        emit("play");
    }

    /** 由 NativeMusicClient 在 Binder 线程调用（媒体中心下发控制动作）。 */
    public static void emit(String action) {
        FlymeMediaCenterModule m = instance;
        if (m == null) {
            ProxyConfig.log("[bridge] 控制动作 " + action + " 到达时 RN 桥尚未就绪");
            return;
        }
        WritableMap params = Arguments.createMap();
        params.putString("action", action);
        try {
            m.reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit(EVENT_ACTION, params);
        } catch (Throwable t) {
            ProxyConfig.log("[bridge] 控制事件发送失败: " + t);
        }
    }

    private static String str(ReadableMap m, String key) {
        return m.hasKey(key) && !m.isNull(key) && m.getString(key) != null
                ? m.getString(key) : "";
    }

    private static double dbl(ReadableMap m, String key) {
        return m.hasKey(key) && !m.isNull(key) ? m.getDouble(key) : 0d;
    }

    @ReactMethod
    public void init() {
        MediaCenterBridge.init(reactContext);
        if (pendingPlay) {
            pendingPlay = false;
            // JS 侧刚挂载，等监听器注册完再派发，避免动作丢失。
            new Handler(Looper.getMainLooper()).postDelayed(new Runnable() {
                @Override
                public void run() {
                    emit("play");
                }
            }, 1500L);
        }
    }

    /** 播放状态、曲目、封面、歌词一次性更新。 */
    @ReactMethod
    public void updateState(ReadableMap state) {
        NowPlaying.title = str(state, "title");
        NowPlaying.artist = str(state, "artist");
        NowPlaying.album = str(state, "album");
        NowPlaying.artwork = str(state, "artwork");
        NowPlaying.durationMs = (long) dbl(state, "duration");
        NowPlaying.playing = state.hasKey("playing") && !state.isNull("playing")
                && state.getBoolean("playing");
        NowPlaying.positionMs = (long) dbl(state, "position");
        if (state.hasKey("lyric")) NowPlaying.lyric = str(state, "lyric");
        if (state.hasKey("lyricLine")) NowPlaying.lyricLine = str(state, "lyricLine");
        MediaCenterBridge.onPositionAnchor(NowPlaying.positionMs, 1f);
        MediaCenterBridge.pushState();
    }

    @ReactMethod
    public void updateLyric(String lyric) {
        NowPlaying.lyric = lyric;
        MediaCenterBridge.pushLyric();
    }

    /** HUD 单行歌词：车机通过 I_GET_CURRENT_LYRIC_SENTENCE 主动 pull。 */
    @ReactMethod
    public void updateLyricLine(String line) {
        NowPlaying.lyricLine = line == null ? "" : line;
    }

    @ReactMethod
    public void updateProgress(double positionMs) {
        NowPlaying.positionMs = (long) positionMs;
        MediaCenterBridge.onPositionAnchor(NowPlaying.positionMs, 1f);
    }

    @ReactMethod
    public void addListener(String eventName) {
    }

    @ReactMethod
    public void removeListeners(Integer count) {
    }
}
