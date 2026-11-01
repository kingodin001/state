package pro.vymi.terrastorm;

import org.json.JSONObject;

/** A remote document can replace IDs, never executable game code or reward rules. */
final class AdSettings {
    static final String[] KEYS={"banner","interstitial","rewarded_result","rewarded_upgrade","rewarded_color","rewarded_bonus"};
    final JSONObject units;
    final boolean enabled;
    AdSettings(JSONObject document) throws Exception {
        if(document.optInt("schemaVersion",-1)!=1 || !"pro.vymi.terrastorm".equals(document.optString("packageName")))
            throw new IllegalArgumentException("Wrong configuration schema or application");
        enabled=document.optBoolean("enabled",true);
        JSONObject input=document.getJSONObject("adUnits"); units=new JSONObject();
        for(String key:KEYS){
            Object value=input.opt(key);
            if(!(value instanceof String))throw new IllegalArgumentException("Missing ad unit: "+key);
            String id=((String)value).trim();
            if(!id.isEmpty()&&!id.matches("R-M-\\d{1,20}-\\d{1,10}"))throw new IllegalArgumentException("Invalid ad unit: "+key);
            units.put(key,id);
        }
    }
    String id(String key){return enabled?units.optString(key,""):"";}
    boolean configured(){for(String key:KEYS)if(!id(key).isEmpty())return true;return false;}
}
