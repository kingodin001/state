package pro.vymi.terrastorm.offline;

import android.app.Application;
import android.content.pm.ApplicationInfo;
import android.content.res.AssetManager;
import android.content.res.Resources;
import android.content.res.loader.ResourcesLoader;
import android.content.res.loader.ResourcesProvider;
import android.os.ParcelFileDescriptor;
import java.io.*;

public final class OfflineApplication extends Application {
    private Resources gameResources;
    private ApplicationInfo gameInfo;
    public File directory() { return new File(super.getApplicationInfo().dataDir, OfflineFactory.DATA_DIRECTORY); }
    public File originalApk() { return new File(super.getApplicationInfo().sourceDir); }
    public synchronized void prepareResources() throws IOException {
        if (gameResources != null) return;
        File data = new File(directory(), "game-data.apk");
        Resources base = super.getResources();
        ResourcesLoader loader = new ResourcesLoader();
        try (ParcelFileDescriptor descriptor = ParcelFileDescriptor.open(data, ParcelFileDescriptor.MODE_READ_ONLY)) {
            loader.addProvider(ResourcesProvider.loadFromApk(descriptor));
        }
        // Only framework-registered Resources can accept loaders on Android 11+.
        base.addLoaders(loader);
        // Match the same package/type/name lookup Unity performs in its real
        // SurfaceView constructor; numeric R references alone cannot test it.
        try (BufferedReader required = new BufferedReader(new InputStreamReader(
                super.getAssets().open("offline/unity-resources.index"), "UTF-8"))) {
            for (String line; (line = required.readLine()) != null;) {
                String[] row = line.split("\t");
                int actual = base.getIdentifier(row[1], row[0], getPackageName());
                if (actual == 0 || actual != (int)Long.parseLong(row[2], 16))
                    throw new IOException("Missing Unity resource: " + row[0] + "/" + row[1]);
                if (row[0].equals("string")) base.getText(actual);
            }
        }
        ApplicationInfo info = new ApplicationInfo(super.getApplicationInfo());
        info.sourceDir = info.publicSourceDir = data.getAbsolutePath();
        info.nativeLibraryDir = new File(directory(), "lib").getAbsolutePath();
        gameInfo = info; gameResources = base;
    }
    @Override public Resources getResources() { return gameResources == null ? super.getResources() : gameResources; }
    @Override public AssetManager getAssets() { return gameResources == null ? super.getAssets() : gameResources.getAssets(); }
    @Override public ApplicationInfo getApplicationInfo() { return gameInfo == null ? super.getApplicationInfo() : gameInfo; }
    @Override public String getPackageCodePath() { return gameInfo == null ? super.getPackageCodePath() : gameInfo.sourceDir; }
}
