/* Native ad handshake. Rewards require the SDK reward callback and dismissal. */
(function(g){'use strict';
class AdsClient{
 constructor(bridge){this.bridge=bridge;this.capabilities={};this.active=null;this.sequence=0;this.refresh();}
 emit(type,detail={}){if(typeof g.dispatchEvent==='function')g.dispatchEvent(new CustomEvent(type,{detail}));}
 refresh(){try{this.capabilities=JSON.parse(this.bridge?.adCapabilities()||'{}');}catch(_){this.capabilities={};}this.refreshButtons();this.emit('terra-ad-state');}
 available(placement){return !!this.capabilities[placement];}
 isBusy(){return !!this.active;}
 refreshButtons(root=g.document){root?.querySelectorAll('[data-ad-placement]').forEach(b=>{b.disabled=!this.available(b.dataset.adPlacement)||b.dataset.adLocked==='true';});g.TerraPresentation?.decorate(root);}
 reward(placement){return this.request(placement,'reward');}
 interstitial(){return this.request('level_end','interstitial');}
 request(placement,kind){
  if(this.active||!this.available(placement)||!this.bridge?.showAd)return Promise.resolve(false);
  return new Promise(resolve=>{const token=Date.now().toString(36)+'_'+(++this.sequence),request={token,placement,kind,resolve,rewarded:false,timer:null};this.active=request;g.document?.documentElement.classList.add('ad-busy');this.emit('terra-ad-start',{placement});request.timer=setTimeout(()=>{try{this.bridge.cancelAd?.(token);}finally{if(this.active===request)this.finish(false);}},30000);try{this.bridge.showAd(placement,token);}catch(_){this.finish(false);}});
 }
 nativeEvent(token,event){const r=this.active;if(!r||token!==r.token)return false;if(event==='shown'){clearTimeout(r.timer);r.timer=null;}else if(event==='reward'){if(r.kind!=='reward')return false;r.rewarded=true;}else if(event==='closed')this.finish(r.kind==='reward'?r.rewarded:true);else if(event==='failed')this.finish(false);return true;}
 finish(value){const r=this.active;if(!r)return;clearTimeout(r.timer);this.active=null;g.document?.documentElement.classList.remove('ad-busy');this.emit('terra-ad-end',{placement:r.placement,rewarded:r.rewarded,completed:!!value});r.resolve(!!value);}
}
g.TerraAdsClient=AdsClient;if(typeof module!=='undefined')module.exports={AdsClient};if(g.document)g.TerraAds=new AdsClient(g.Android);
})(globalThis);
