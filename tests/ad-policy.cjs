const{test}=require('node:test'),A=require('node:assert/strict'),P=require('../app/src/main/assets/ad-policy.js');
test('Interstitials occur after campaign victories 5,7,9 and never before level 5',()=>{for(let n=1;n<=200;n++){A.equal(P.eligible(n,'win'),n>=5&&n%2===1,'level '+n);for(const outcome of ['lose',null])A.equal(P.eligible(n,outcome),false);for(const mode of ['duel','rush','operation'])A.equal(P.eligible(n,'win',mode),false);}});
test('Invalid level values cannot trigger an interstitial',()=>{for(const n of [0,-1,NaN,Infinity,5.5,'5'])A.equal(P.eligible(n,'win'),false);});
