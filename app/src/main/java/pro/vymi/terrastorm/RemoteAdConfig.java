package pro.vymi.terrastorm;

import android.content.Context;
import android.content.SharedPreferences;
import org.json.JSONObject;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/** Small HTTPS configuration with validated last-good cache; never blocks startup. */
final class RemoteAdConfig {
    interface Listener { void updated(AdSettings settings); }
    private final SharedPreferences cache;
    private final String endpoint;
    private final ExecutorService worker=Executors.newSingleThreadExecutor();
    private volatile boolean closed,busy;
    private long attempted;
    RemoteAdConfig(Context context,String endpoint){this.endpoint=endpoint;cache=context.getSharedPreferences("ads-config-v1",Context.MODE_PRIVATE);}
    AdSettings cached(AdSettings fallback){try{return new AdSettings(new JSONObject(cache.getString("document","")));}catch(Exception invalid){return fallback;}}
    synchronized void refresh(Listener listener){
        long now=android.os.SystemClock.elapsedRealtime();
        if(closed||busy||(attempted>0&&now-attempted<15*60*1000))return;
        busy=true;attempted=now;
        worker.execute(()->{
            HttpURLConnection connection=null;
            try{
                URL url=new URL(endpoint);
                if(!"https".equals(url.getProtocol())||!"games-api.vymi.pro".equals(url.getHost())||url.getUserInfo()!=null||(url.getPort()!=-1&&url.getPort()!=443))return;
                connection=(HttpURLConnection)url.openConnection();
                connection.setConnectTimeout(5000);connection.setReadTimeout(5000);connection.setInstanceFollowRedirects(false);
                connection.setRequestProperty("Accept","application/json");connection.setRequestProperty("Cache-Control","no-cache");
                if(connection.getResponseCode()!=200)return;
                String type=connection.getContentType();if(type==null||!type.toLowerCase(java.util.Locale.ROOT).contains("application/json"))return;
                if(connection.getContentLength()>32768)return;
                ByteArrayOutputStream out=new ByteArrayOutputStream();
                try(InputStream in=connection.getInputStream()){
                    byte[] bytes=new byte[4096];int n;
                    while((n=in.read(bytes))!=-1){if(out.size()+n>32768)return;out.write(bytes,0,n);}
                }
                String text=out.toString("UTF-8");AdSettings settings=new AdSettings(new JSONObject(text));
                if(closed)return;
                cache.edit().putString("document",text).apply();listener.updated(settings);
            }catch(Exception unavailable){/* Keep the validated cache or bundled defaults. */}
            finally{if(connection!=null)connection.disconnect();busy=false;}
        });
    }
    void close(){closed=true;worker.shutdownNow();}
}
