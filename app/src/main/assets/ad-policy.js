/* Campaign interstitials after levels 18, 20...80, then every level from 81; voluntary rewards remain separate. */
(function(g){'use strict';
function eligible(levelNumber,result,mode='campaign'){return mode==='campaign'&&result==='win'&&Number.isSafeInteger(levelNumber)&&levelNumber>=18&&(levelNumber>80||(levelNumber-18)%2===0);}
g.TerraAdPolicy={eligible};if(typeof module!=='undefined')module.exports=g.TerraAdPolicy;
})(globalThis);
