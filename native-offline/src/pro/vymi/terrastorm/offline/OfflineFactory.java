package pro.vymi.terrastorm.offline;

import android.app.AppComponentFactory;
import android.content.pm.ApplicationInfo;
import android.app.Activity;
import android.content.Intent;
import java.io.File;
import dalvik.system.DexClassLoader;

/** Gives System.loadLibrary the offline directory before any Unity classes load. */
public final class OfflineFactory extends AppComponentFactory {
    public static final String DATA_DIRECTORY = "native-offline-v9";
    private File directory;
    private ClassLoader gameClassLoader;
    @Override public ClassLoader instantiateClassLoader(ClassLoader original, ApplicationInfo info) {
        directory = new File(info.dataDir, DATA_DIRECTORY);
        return original;
    }
    @Override public Activity instantiateActivity(ClassLoader cl, String name, Intent intent)
            throws InstantiationException, IllegalAccessException, ClassNotFoundException {
        if (name.equals("pro.vymi.terrastorm.offline.NativeGameActivity")) {
            if (gameClassLoader == null) {
                File libraries = new File(directory, "lib");
                File optimized = new File(directory, "dex-cache"); optimized.mkdirs();
                gameClassLoader = new DexClassLoader(new File(directory, "game-java.apk").getAbsolutePath(),
                    optimized.getAbsolutePath(), libraries.getAbsolutePath(), cl);
            }
            cl = gameClassLoader;
        }
        return super.instantiateActivity(cl, name, intent);
    }
}
