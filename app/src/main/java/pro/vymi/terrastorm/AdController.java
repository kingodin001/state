package pro.vymi.terrastorm;

import android.app.Activity;
import android.view.View;
import android.widget.FrameLayout;
import android.webkit.WebView;
import com.yandex.mobile.ads.common.*;
import com.yandex.mobile.ads.banner.*;
import com.yandex.mobile.ads.interstitial.*;
import com.yandex.mobile.ads.rewarded.*;
import org.json.JSONObject;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

/** Yandex-only ads. Empty placement IDs disable requests; callbacks grant no game resources here. */
final class AdController {
    private final Activity activity;
    private final WebView web;
    private final FrameLayout bannerHost;
    private JSONObject placements = new JSONObject();
    private volatile AdSettings settings;
    private AdSettings pendingSettings;
    private RemoteAdConfig remote;
    private boolean sdkStarting;
    private int generation;
    private volatile boolean initialized;
    private boolean destroyed, bannerWanted = true, interstitialLoading;
    private BannerAdView banner;
    private InterstitialAdLoader interstitialLoader;
    private InterstitialAd interstitial;
    private RewardedAdLoader rewardedLoader;
    private final Map<String, RewardedAd> rewarded = new HashMap<>();
    private final Set<String> loading = new HashSet<>();
    private Session session;
    private static final class Session {
        final String token, placement;
        boolean awarded, finished;
        Session(String token, String placement) { this.token=token; this.placement=placement; }
    }
    AdController(Activity a, WebView w, FrameLayout host) {
        activity=a; web=w; bannerHost=host;
        try (InputStream in=a.getAssets().open("ads-config.json")) {
            ByteArrayOutputStream out=new ByteArrayOutputStream(); byte[] b=new byte[4096]; int n;
            while ((n=in.read(b))!=-1) out.write(b,0,n);
            JSONObject cfg=new JSONObject(out.toString("UTF-8")); settings=new AdSettings(cfg);placements=cfg.getJSONObject("placements");
            remote=new RemoteAdConfig(a,cfg.optString("remoteConfigUrl"));settings=remote.cached(settings);
        } catch (Exception ignored) { }
    }
    private String id(String kind) { return settings==null?"":settings.id(kind); }
    void initialize() {
        if(destroyed)return;refreshConfig();startSdk();
    }
    void refreshConfig(){if(remote!=null)remote.refresh(next->activity.runOnUiThread(()->applySettings(next)));}
    private void applySettings(AdSettings next){
        if(destroyed)return;
        if(session!=null){pendingSettings=next;return;}
        if(settings!=null&&settings.enabled==next.enabled&&settings.units.toString().equals(next.units.toString()))return;
        settings=next;generation++;
        if(banner!=null){banner.setBannerAdEventListener(null);banner.destroy();banner=null;}bannerHost.removeAllViews();bannerHost.setVisibility(View.GONE);
        if(interstitial!=null)interstitial.setAdEventListener(null);interstitial=null;interstitialLoading=false;rewarded.clear();loading.clear();
        if(initialized){loadBanner();preloadInterstitial();notifyState();}else startSdk();
    }
    private void startSdk(){
        if(destroyed||initialized||sdkStarting||settings==null||!settings.configured())return;
        sdkStarting=true;
        YandexAds.setLocationTracking(false);
        YandexAds.setAppAdAnalyticsReporting(false);
        YandexAds.initialize(activity, () -> {
            sdkStarting=false;if (destroyed) return;
            initialized=true; interstitialLoader=new InterstitialAdLoader(activity); rewardedLoader=new RewardedAdLoader(activity);
            loadBanner(); preloadInterstitial(); notifyState();
        });
    }
    String capabilities() {
        JSONObject caps=new JSONObject();
        try {
            caps.put("level_end", initialized && !id("interstitial").isEmpty());
            caps.put("banner", initialized && !id("banner").isEmpty());
            for (java.util.Iterator<String> i=placements.keys();i.hasNext();) {String p=i.next();caps.put(p, initialized&&!id(placements.optString(p)).isEmpty());}
        } catch (Exception ignored) { }
        return caps.toString();
    }
    private void notifyState() { if(!destroyed) web.evaluateJavascript("window.TerraAds&&TerraAds.refresh()",null); }
    private void event(Session s, String event) {
        if (!destroyed && s!=null) web.evaluateJavascript("window.TerraAds&&TerraAds.nativeEvent("+JSONObject.quote(s.token)+","+JSONObject.quote(event)+")",null);
    }
    void bannerVisible(boolean visible) {
        bannerWanted=visible;
        bannerHost.setVisibility(visible && banner!=null && banner.getVisibility()==View.VISIBLE ? View.VISIBLE : View.GONE);
    }
    private void loadBanner() {
        if (destroyed || id("banner").isEmpty()) return;
        final int requestedGeneration=generation;
        banner=new BannerAdView(activity);final BannerAdView requestedBanner=banner;banner.setVisibility(View.INVISIBLE);
        int pixels=web.getWidth()>0?web.getWidth():activity.getResources().getDisplayMetrics().widthPixels;
        int width=Math.round(pixels/activity.getResources().getDisplayMetrics().density);
        banner.setAdSize(BannerAdSize.sticky(activity,width));
        bannerHost.addView(banner,new FrameLayout.LayoutParams(-1,-2));
        banner.setBannerAdEventListener(new BannerAdEventListener() {
            public void onAdLoaded() { if(destroyed||requestedGeneration!=generation){requestedBanner.destroy();return;}requestedBanner.setVisibility(View.VISIBLE);bannerHost.setVisibility(bannerWanted?View.VISIBLE:View.GONE); }
            public void onAdFailedToLoad(AdRequestError error) {if(requestedGeneration==generation)bannerHost.setVisibility(View.GONE); }
            public void onAdClicked() { }
            public void onImpression(ImpressionData data) { }
        });
        banner.loadAd(new AdRequest.Builder(id("banner")).build());
    }
    private void preloadInterstitial() {
        if(destroyed || !initialized || interstitialLoading || interstitial!=null || id("interstitial").isEmpty()) return;
        interstitialLoading=true;final int requestedGeneration=generation;
        interstitialLoader.loadAd(new AdRequest.Builder(id("interstitial")).build(),new InterstitialAdLoadListener() {
            public void onAdLoaded(InterstitialAd ad) { if(requestedGeneration!=generation||destroyed){ad.setAdEventListener(null);return;}interstitialLoading=false;interstitial=ad; }
            public void onAdFailedToLoad(AdRequestError error) {if(requestedGeneration==generation)interstitialLoading=false; }
        });
    }
    void show(String placement, String token) {
        if(!token.matches("[A-Za-z0-9_-]{1,80}")) return;
        Session s=new Session(token,placement);
        if(destroyed || !initialized || settings==null || !settings.configured() || session!=null) {event(s,"failed");return;}
        if(placement.equals("level_end")) {
            if(id("interstitial").isEmpty()){event(s,"failed");return;}
            if(interstitial==null){event(s,"failed");preloadInterstitial();return;}
            session=s; InterstitialAd ad=interstitial;interstitial=null;
            ad.setAdEventListener(new InterstitialAdEventListener() {
                public void onAdShown(){event(s,"shown");}
                public void onAdFailedToShow(AdError error){ad.setAdEventListener(null);finish(s,false);preloadInterstitial();}
                public void onAdDismissed(){ad.setAdEventListener(null);finish(s,true);preloadInterstitial();}
                public void onAdClicked(){}
                public void onAdImpression(ImpressionData data){}
            });
            try { ad.show(activity); } catch(RuntimeException error) {ad.setAdEventListener(null);finish(s,false);}
            return;
        }
        String unit=id(placements.optString(placement));
        if(unit.isEmpty()){event(s,"failed");return;}
        session=s; RewardedAd ad=rewarded.remove(unit);
        if(ad!=null){showRewarded(s,ad);return;}
        if(loading.contains(unit)){finish(s,false);return;}
        loading.add(unit);
        rewardedLoader.loadAd(new AdRequest.Builder(unit).build(),new RewardedAdLoadListener(){
            public void onAdLoaded(RewardedAd ad){loading.remove(unit);if(destroyed || session!=s || s.finished){ad.setAdEventListener(null);return;}showRewarded(s,ad);}
            public void onAdFailedToLoad(AdRequestError error){loading.remove(unit);finish(s,false);}
        });
    }
    private void showRewarded(Session s,RewardedAd ad) {
        ad.setAdEventListener(new RewardedAdEventListener(){
            public void onAdShown(){event(s,"shown");}
            public void onAdFailedToShow(AdError error){ad.setAdEventListener(null);finish(s,false);}
            public void onAdDismissed(){ad.setAdEventListener(null);finish(s,true);}
            public void onAdClicked(){}
            public void onAdImpression(ImpressionData data){}
            public void onRewarded(Reward reward){if(session==s&&!s.finished&&!s.awarded){s.awarded=true;event(s,"reward");}}
        });
        try {ad.show(activity);} catch(RuntimeException error){ad.setAdEventListener(null);finish(s,false);}
    }
    private void finish(Session s,boolean closed) {
        if(s.finished)return;s.finished=true;event(s,closed?"closed":"failed");if(session==s)session=null;if(pendingSettings!=null){AdSettings next=pendingSettings;pendingSettings=null;applySettings(next);}
    }
    void cancel(String token){if(session!=null&&session.token.equals(token)){finish(session,false);}}
    void destroy(){destroyed=true;if(remote!=null)remote.close();session=null;initialized=false;if(banner!=null){banner.setBannerAdEventListener(null);banner.destroy();}if(interstitial!=null)interstitial.setAdEventListener(null);for(RewardedAd ad:rewarded.values())ad.setAdEventListener(null);rewarded.clear();loading.clear();rewardedLoader=null;interstitialLoader=null;}
}
