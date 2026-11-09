package cn.toside.music.mobile.car;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/**
 * 车机「恢复上次音源」的落点。
 *
 * 注册时通过 registerMusicRecoveryIntent 把 ACTION_RECOVER 交给车机，
 * 车机需要把本音源重新拉起时会把这个 Intent 发回来（冷启动时进程可能尚未运行）。
 * 这里先确保通信层可用，再让 RN 侧恢复播放；若 RN 桥还没就绪，
 * FlymeMediaCenterModule 会在 init 时消费这个待办。
 */
public class RecoverReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent == null ? "null" : String.valueOf(intent.getAction());
        ProxyConfig.log("[恢复] 收到 " + action);
        try {
            MediaCenterBridge.init(context.getApplicationContext());
        } catch (Throwable t) {
            ProxyConfig.log("[恢复] 初始化失败: " + t);
        }
        try {
            MediaCenterBridge.recoverRegistration("车机恢复音源");
        } catch (Throwable t) {
            ProxyConfig.log("[恢复] 重注册失败: " + t);
        }
        FlymeMediaCenterModule.requestPlayOnReady();
    }
}
