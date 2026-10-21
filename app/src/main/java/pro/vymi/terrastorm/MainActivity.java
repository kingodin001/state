package pro.vymi.terrastorm;

import android.app.Activity;
import android.os.Bundle;
import android.os.Build;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.graphics.Color;
import android.view.View;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebResourceRequest;

/** Offline Android host. No network, advertising SDKs or remote code. */
public final class MainActivity extends Activity {
    private WebView webView;
    private static final String ENTRY = "file:///android_asset/game/index.html";
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        if (Build.VERSION.SDK_INT >= 28) {
            WindowManager.LayoutParams attrs = getWindow().getAttributes();
            attrs.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            getWindow().setAttributes(attrs);
        }
        immersive();
        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(237,242,247));
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(false);
        settings.setAllowFileAccessFromFileURLs(false);
        settings.setAllowUniversalAccessFromFileURLs(false);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        if (Build.VERSION.SDK_INT >= 26) settings.setSafeBrowsingEnabled(true);
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
        webView.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return !request.getUrl().toString().startsWith("file:///android_asset/game/");
            }
        });
        webView.addJavascriptInterface(new DeviceBridge(), "Android");
        setContentView(webView);
        webView.loadUrl(ENTRY);
    }
    private void immersive() {
        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION |
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_LAYOUT_STABLE |
            View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION);
    }
    @Override public void onWindowFocusChanged(boolean hasFocus) { super.onWindowFocusChanged(hasFocus); if (hasFocus) immersive(); }
    @Override public void onBackPressed() {
        if (webView == null) { super.onBackPressed(); return; }
        webView.evaluateJavascript("window.terraBack ? window.terraBack() : false", new android.webkit.ValueCallback<String>() {
            @Override public void onReceiveValue(String value) {
                if (!"true".equals(value)) MainActivity.super.onBackPressed();
            }
        });
    }
    @Override protected void onPause() {
        if (webView != null) {
            webView.evaluateJavascript("document.dispatchEvent(new Event('terraPause'))", null);
            webView.onPause();
        }
        super.onPause();
    }
    @Override protected void onResume() { super.onResume(); if (webView != null) { webView.onResume(); webView.evaluateJavascript("document.dispatchEvent(new Event('terraResume'))", null); } immersive(); }
    @Override protected void onDestroy() {
        if (webView != null) { webView.removeJavascriptInterface("Android"); webView.destroy(); webView=null; }
        super.onDestroy();
    }
    private final class DeviceBridge {
        @JavascriptInterface public void vibrate() {
            runOnUiThread(new Runnable() { @Override public void run() {
                Vibrator v=(Vibrator)getSystemService(VIBRATOR_SERVICE);
                if(v!=null&&v.hasVibrator())v.vibrate(VibrationEffect.createOneShot(15,VibrationEffect.DEFAULT_AMPLITUDE));
            }});
        }
    }
}
