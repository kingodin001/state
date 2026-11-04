/* Arithmetic recovered from State.io 4.4.2 ARM64 BotCalculationLogicV3/V4/V5.
 * This module does not imply equivalence of the entire native group simulator. */
(function(g){'use strict';
function sendPopulation(n,partial){n=Math.floor(n);return n<1?0:partial?Math.max(1,Math.floor(n/2)):n;}
function penalty(score,factor){return score>=0?score*factor:score-Math.abs(score)*(1-factor);}
function reachTime(trace,reached,popAtReached,last){const elapsed=trace-reached,loss=popAtReached-last;return reached<0||elapsed<=0||loss<=0?-1:reached+popAtReached/(loss/elapsed);}
function v4Score(before,after,s,reached=-1,expected=false){const f=Math.fround;let score=f(f(f(after.forces-before.forces)/Math.max(before.forces,1))*s._forcesBalanceFactor+f(f((expected?1:after.buildings-before.buildings))/Math.max(before.buildings,1))*s._buildingsBalanceFactor);if(reached>=0)score=penalty(score,Math.pow(1-s._goalReachPenaltyPercent/100,reached/.5));return score;}
function v3Score(before,after,s,reached=-1,trace=1){let score=(after.forces-before.forces)/Math.max(before.forces,1)*s._forcesBalanceFactor+(after.buildings-before.buildings)/Math.max(before.buildings,1)*s._buildingsBalanceFactor;if(reached>=0)score+=Math.abs(score)*s._targetReachedTimeBoost*(1-Math.max(0,Math.min(1,reached/trace)));return score;}
function interest(score,factor,multiplier=1){return score>=0?score*factor*Math.max(multiplier,0):-Math.abs(score)*factor/Math.max(multiplier,.0001);}
function commandInterest(command,weight){if(!command.sources?.length)return 1;const f=Math.fround,avg=f(command.sources.reduce((n,id)=>f(n+weight(id)),0)/command.sources.length);return f(weight(command.target)*f(Math.exp(f(-1.5*avg))));}
const api={commandInterest,sendPopulation,penalty,reachTime,v3Score,v4Score,interest};g.TerraSourceAIMath=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
