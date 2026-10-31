/* One-battle ad-confirmed boosts. Stored consumables never authorize these choices. */
(function(g){'use strict';
class Selection {
 constructor(level,configs){this.level=level;this.allowed=new Set(configs.filter(x=>x.available).map(x=>x._bonusType));this.confirmed=new Set();this.busy=false;this.closed=false;}
 get selected(){return [...this.confirmed];}
 async watch(type,ads){
  if(this.closed||this.busy||!this.allowed.has(type)||this.confirmed.has(type)||!ads?.available('battle_bonus'))return false;
  this.busy=true;
  try{if(!await ads.reward('battle_bonus')||this.closed)return false;this.confirmed.add(type);return true;}finally{this.busy=false;}
 }
 take(level){if(this.closed||this.busy||this.level!==level)return null;const selected=this.selected;this.closed=true;return selected;}
 cancel(){this.closed=true;this.confirmed.clear();}
}
g.TerraPrebattle={Selection};if(typeof module!=='undefined')module.exports=g.TerraPrebattle;
})(globalThis);
