package pro.vymi.terrastorm.offline;

import android.content.pm.ApplicationInfo;
import android.content.res.AssetManager;
import android.content.res.Resources;
import android.os.Bundle;
import java.io.*;

/** Original Unity activity/controls; only its on-disk asset location is adapted. */
public final class NativeGameActivity extends com.unity3d.player.UnityPlayerActivity {
    @Override public void onCreate(Bundle state) {
        // Own-process Android/Unity errors let the next launch report a failed
        // JNI initialization even when the native activity only appears stuck.
        Thread errors = new Thread(() -> {
            try {
                Process logs = new ProcessBuilder("logcat", "--pid=" + android.os.Process.myPid(),
                    "-v", "brief", "*:E").redirectErrorStream(true).start();
                try (BufferedReader in = new BufferedReader(new InputStreamReader(logs.getInputStream()));
                     PrintWriter out = new PrintWriter(new File(getFilesDir(), "unity-errors.txt"))) {
                    int written = 0;
                    for (String line; written < 128 * 1024 && (line = in.readLine()) != null;) {
                        out.println(line); out.flush(); written += line.length();
                    }
                } finally { logs.destroy(); }
            } catch (IOException ignored) {}
        }, "unity-own-process-errors");
        errors.setDaemon(true); errors.start();
        super.onCreate(state);
    }
    private OfflineApplication host() { return (OfflineApplication)getApplication(); }
    @Override public ApplicationInfo getApplicationInfo() { return getApplication() == null ? super.getApplicationInfo() : host().getApplicationInfo(); }
    @Override public Resources getResources() { return getApplication() == null ? super.getResources() : host().getResources(); }
    @Override public AssetManager getAssets() { return getApplication() == null ? super.getAssets() : host().getAssets(); }
    @Override public String getPackageCodePath() { return getApplication() == null ? super.getPackageCodePath() : host().getPackageCodePath(); }
    @Override public ClassLoader getClassLoader() { return getClass().getClassLoader(); }
}
