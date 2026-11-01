package pro.vymi.terrastorm;
import org.json.JSONObject;
import org.junit.Test;
import static org.junit.Assert.*;
public class AdSettingsTest {
 private JSONObject doc()throws Exception{JSONObject d=new JSONObject().put("schemaVersion",1).put("packageName","pro.vymi.terrastorm");JSONObject units=new JSONObject();for(String key:AdSettings.KEYS)units.put(key,"");return d.put("adUnits",units);}
 @Test public void emptyIdsDisableAllRequests()throws Exception{AdSettings s=new AdSettings(doc());assertFalse(s.configured());assertEquals("",s.id("banner"));}
 @Test public void validRemoteIdsEnableOnlyConfiguredFormats()throws Exception{JSONObject d=doc();d.getJSONObject("adUnits").put("banner"," R-M-1234567-1 ");AdSettings s=new AdSettings(d);assertTrue(s.configured());assertEquals("R-M-1234567-1",s.id("banner"));assertEquals("",s.id("interstitial"));}
 @Test public void serverCanDisableAllAds()throws Exception{JSONObject d=doc().put("enabled",false);d.getJSONObject("adUnits").put("banner","R-M-1234567-1");assertFalse(new AdSettings(d).configured());}
 @Test public void wrongAppSchemaMalformedOrMissingUnitsAreRejected()throws Exception{for(JSONObject d:new JSONObject[]{doc().put("packageName","another.app"),doc().put("schemaVersion",2),doc().put("adUnits",new JSONObject()),doc().put("adUnits",doc().getJSONObject("adUnits").put("banner","demo-banner-yandex")),doc().put("adUnits",doc().getJSONObject("adUnits").put("banner",123))}){try{new AdSettings(d);fail("Invalid document accepted");}catch(IllegalArgumentException|org.json.JSONException expected){}}}
}
