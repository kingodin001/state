/* One resource symbol per currency, shared by wallets, shop, prices and rewards. */
(function(g){'use strict';
 const keys=['coins','gems','supply','tickets','stars'];
 function resource(kind,extra=''){if(!keys.includes(kind))return '';return '<span class="resource-icon resource-'+kind+' '+extra+'" aria-hidden="true"></span>';}
 function amount(kind,value){return '<span class="cost '+kind+'">'+resource(kind)+'<b>'+Math.floor(value).toLocaleString('ru-RU')+'</b></span>';}
 function escape(text){return String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
 function short(n){return n>=1000000?(n/1e6).toFixed(1)+'м':n>=10000?Math.floor(n/1000)+'к':Math.floor(n).toLocaleString('ru-RU');}
 g.TerraUI={resource,amount,escape,short};if(typeof module!=='undefined')module.exports=g.TerraUI;
})(typeof globalThis!=='undefined'?globalThis:this);
