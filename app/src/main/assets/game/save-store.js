/* Keep a same-tab checkpoint when a WebView reload reads an older disk snapshot. */
(function(g){'use strict';
const key='terra-storm-v1';
function load(stores){let best=null;for(const store of stores){try{const value=JSON.parse(store?.getItem(key)||'null');if(value&&typeof value==='object'&&!Array.isArray(value)&&(!best||(value.saveRevision||0)>(best.saveRevision||0)))best=value;}catch(_){}}return best||{};}
function save(data,stores,now=Date.now()){data.saveRevision=Math.max(now,(data.saveRevision||0)+1);const value=JSON.stringify(data);let written=false;for(const store of stores){try{if(store){store.setItem(key,value);written=true;}}catch(_){}}return written;}
const api={load,save,key};g.TerraSaveStore=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
