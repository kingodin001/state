/* Campaign interstitials after levels 5, 7, 9...; voluntary rewards remain separate. */
(function(g){'use strict';
function eligible(levelNumber,result,mode='campaign'){return mode==='campaign'&&result==='win'&&Number.isSafeInteger(levelNumber)&&levelNumber>=5&&(levelNumber-5)%2===0;}
g.TerraAdPolicy={eligible};if(typeof module!=='undefined')module.exports=g.TerraAdPolicy;
})(globalThis);
