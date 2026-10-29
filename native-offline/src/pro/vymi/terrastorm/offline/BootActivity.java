package pro.vymi.terrastorm.offline;

import android.app.*;
import android.content.*;
import android.os.*;
import android.view.*;
import android.widget.*;
import java.io.*;
import java.util.*;

/** Local preparation and a readable error screen instead of a silent Java crash. */
public final class BootActivity extends Activity {
    private TextView message;
    private ProgressBar progress;
    private LinearLayout panel;
    private long lastUpdate;
    private static final int BUILD = 10;
    private long buildStartedAt;
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        panel = new LinearLayout(this); panel.setOrientation(LinearLayout.VERTICAL);
        int pad = (int)(24 * getResources().getDisplayMetrics().density);
        panel.setPadding(pad, pad, pad, pad); panel.setGravity(Gravity.CENTER);
        panel.setBackgroundColor(0xff152940);
        TextView title = new TextView(this); title.setText("ТЕРРА ШТОРМ");
        title.setTextColor(0xffffffff); title.setTextSize(24); panel.addView(title);
        message = new TextView(this); message.setTextColor(0xffd6e7fa); message.setTextSize(16);
        message.setPadding(0, pad, 0, pad); message.setTextIsSelectable(true); panel.addView(message);
        progress = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        progress.setMax(1000); panel.addView(progress, new LinearLayout.LayoutParams(-1, -2));
        setContentView(panel);
        SharedPreferences settings = getSharedPreferences("native-diagnostics", MODE_PRIVATE);
        if (settings.getInt("build", 0) != BUILD) {
            archiveReports("previous-build");
            settings.edit().putInt("build", BUILD).putLong("buildStartedAt", System.currentTimeMillis()).apply();
        }
        buildStartedAt = settings.getLong("buildStartedAt", 0);
        Thread.setDefaultUncaughtExceptionHandler((thread, error) -> {
            try (PrintWriter out = new PrintWriter(new File(getFilesDir(), "native-last-error.txt"))) {
                error.printStackTrace(out);
            } catch (Exception ignored) {}
            android.os.Process.killProcess(android.os.Process.myPid());
        });
        String previous = previousNativeExit();
        if (previous != null) showFailure(previous); else prepare();
    }
    private void archiveReports(String suffix) {
        for (String name : new String[]{"native-last-error.txt", "unity-errors.txt"}) {
            File file = new File(getFilesDir(), name);
            if (file.isFile()) file.renameTo(new File(getFilesDir(), name + "." + suffix));
        }
    }
    private void showFailure(String report) {
        while (panel.getChildCount() > 3) panel.removeViewAt(3);
        message.setText("Не удалось запустить игру. Можно повторить запуск или скопировать отчёт об ошибке.");
        progress.setVisibility(View.GONE);
        Button retry = new Button(this); retry.setText("Повторить запуск");
        retry.setOnClickListener(v -> { archiveReports("previous-attempt"); prepare(); }); panel.addView(retry);
        Button copy = new Button(this); copy.setText("Скопировать диагностику");
        copy.setOnClickListener(v -> {
            ((ClipboardManager)getSystemService(CLIPBOARD_SERVICE)).setPrimaryClip(ClipData.newPlainText("Terra Storm diagnostic", report));
            Toast.makeText(this, "Отчёт скопирован", Toast.LENGTH_SHORT).show();
        }); panel.addView(copy);
    }
    private String previousNativeExit() {
        try {
            File javaError = new File(getFilesDir(), "native-last-error.txt");
            if (javaError.isFile()) try (InputStream in = new FileInputStream(javaError)) { return read(in); }
            File unityError = new File(getFilesDir(), "unity-errors.txt");
            if (unityError.isFile()) {
                String text;
                try (InputStream in = new FileInputStream(unityError)) { text = read(in); }
                if (text.contains("AndroidJavaException") || text.contains("ClassNotFoundException") ||
                        text.contains("UnsatisfiedLinkError") || text.contains("FATAL EXCEPTION"))
                    return "Ошибка предыдущего запуска Unity:\n" + text;
            }
            ActivityManager manager = (ActivityManager)getSystemService(ACTIVITY_SERVICE);
            List<ApplicationExitInfo> exits = manager.getHistoricalProcessExitReasons(getPackageName(), 0, 1);
            if (!exits.isEmpty()) {
                ApplicationExitInfo e = exits.get(0);
                if (e.getTimestamp() < buildStartedAt) return null;
                if (e.getReason() == ApplicationExitInfo.REASON_CRASH_NATIVE || e.getReason() == ApplicationExitInfo.REASON_ANR) {
                    String report = "Предыдущий запуск завершился с ошибкой.\nAndroid " + Build.VERSION.RELEASE +
                        " · " + Build.MODEL + "\nПричина: " + e.getReason() + "\n" + e.getDescription();
                    try (InputStream trace = e.getTraceInputStream()) { if (trace != null) report += "\n" + read(trace); }
                    return report;
                }
            }
        } catch (Exception ignored) {}
        return null;
    }
    private static String read(InputStream in) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream(); byte[] b = new byte[8192];
        for (int n; out.size() < 512 * 1024 && (n = in.read(b)) > 0;) out.write(b, 0, n);
        return new String(out.toByteArray(), java.nio.charset.StandardCharsets.UTF_8);
    }
    private void prepare() {
        while (panel.getChildCount() > 3) panel.removeViewAt(3);
        progress.setVisibility(View.VISIBLE);
        message.setText("Подготовка игры…");
        new Thread(() -> {
            try {
                OfflineApplication host = (OfflineApplication)getApplication();
                new PayloadInstaller(host.originalApk(), host.directory(), (done, total) -> {
                    long now = SystemClock.elapsedRealtime();
                    if (now - lastUpdate < 200) return; lastUpdate = now;
                    int value = total == 0 ? 0 : (int)Math.min(1000, 1000 * done / total);
                    runOnUiThread(() -> progress.setProgress(value));
                }).install();
                runOnUiThread(() -> {
                    try {
                        host.prepareResources();
                        startActivity(new Intent().setClassName(getPackageName(), "pro.vymi.terrastorm.offline.NativeGameActivity")); finish();
                    } catch (Throwable error) {
                        StringWriter report = new StringWriter(); error.printStackTrace(new PrintWriter(report));
                        showFailure(report.toString());
                    }
                });
            } catch (Throwable error) {
                StringWriter buffer = new StringWriter(); error.printStackTrace(new PrintWriter(buffer));
                runOnUiThread(() -> showFailure(buffer.toString()));
            }
        }, "offline-game-install").start();
    }
}
