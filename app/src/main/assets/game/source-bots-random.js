/* BotsRandom uses Unity.Mathematics.Random, independently of System.Random. */
(function(g){'use strict';
const F=Math.fround;
class BotsRandom {
 constructor(seed){this.regenerate(seed);}
 regenerate(seed){let x=((seed|0)+62)>>>0;x=(x^(x>>>16)^61)>>>0;x=Math.imul(x,9)>>>0;x=(x^(x>>>4))>>>0;x=Math.imul(x,0x27d4eb2d)>>>0;x=(x^(x>>>15))>>>0;this.state=this.advance(x);return this;}
 advance(x){x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;}
 take(){const x=this.state;this.state=this.advance(x);return x;}
 next(){return (this.take()>>>9)/8388608;}
 int(min,max){if(max===undefined){max=min;min=0;}return min+Number((BigInt(this.take())*BigInt((max-min)>>>0))>>32n);}
 float(min,max){if(max===undefined){max=min;min=0;}return F(F(min)+F(F(F(max)-F(min))*this.next()));}
}
const api={BotsRandom};g.TerraSourceBotsRandom=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
